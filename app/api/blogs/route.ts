import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { blogs as dbBlogs, activityLogs as dbActivityLogs } from '@/src/db/schema';
import { getAuthAdmin, ensureDbSeeded } from '@/src/lib/server-backend';

export async function GET() {
  try {
    await ensureDbSeeded();
    const results = await db.select().from(dbBlogs);
    return NextResponse.json(results);
  } catch (error) {
    console.error('Fetch blogs error:', error);
    return NextResponse.json({ error: 'Internal server error fetching blogs.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await ensureDbSeeded();
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const body = await req.json();
    const { slug, category, tags, featuredImageIdea, en, bn } = body;

    if (!slug || !category || !en || !bn || !en.title || !bn.title) {
      return NextResponse.json(
        { error: 'Slug, category, English title, and Bengali title are required.' },
        { status: 400 }
      );
    }

    const id = 'blog-' + Math.floor(100000 + Math.random() * 900000);
    const newBlog = {
      id,
      slug,
      category,
      tags: Array.isArray(tags) ? tags : [],
      featuredImageIdea: featuredImageIdea || '',
      en,
      bn,
    };

    await db.insert(dbBlogs).values(newBlog);

    const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
    await db.insert(dbActivityLogs).values({
      id: logId,
      timestamp: new Date(),
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'Created Blog Post',
      details: `Published health article "${en.seoTitle || en.title}" (Slug: ${slug}).`,
    });

    return NextResponse.json(newBlog, { status: 201 });
  } catch (error) {
    console.error('Create blog post error:', error);
    return NextResponse.json({ error: 'Internal server error creating blog article.' }, { status: 500 });
  }
}
