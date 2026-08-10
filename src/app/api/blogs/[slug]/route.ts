import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/src/db/index';
import { blogs as dbBlogs, activityLogs as dbActivityLogs } from '@/src/db/schema';
import { eq, or } from 'drizzle-orm';
import { getAuthAdmin, ensureDbSeeded } from '@/src/lib/server-backend';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await ensureDbSeeded();
    const { slug } = await params;
    const results = await db
      .select()
      .from(dbBlogs)
      .where(or(eq(dbBlogs.slug, slug), eq(dbBlogs.id, slug)));

    const blog = results[0];
    if (!blog) {
      return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error('Fetch single blog error:', error);
    return NextResponse.json({ error: 'Internal server error fetching article details.' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { slug: id } = await params;
    const existing = await db
      .select()
      .from(dbBlogs)
      .where(or(eq(dbBlogs.id, id), eq(dbBlogs.slug, id)));

    if (existing.length === 0) {
      return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });
    }

    const body = await req.json();
    await db
      .update(dbBlogs)
      .set(body)
      .where(eq(dbBlogs.id, existing[0].id));

    const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
    await db.insert(dbActivityLogs).values({
      id: logId,
      timestamp: new Date(),
      adminUsername: admin.username,
      adminRole: admin.role,
      action: 'Updated Blog Post',
      details: `Modified health article "${existing[0].slug}" (ID: ${existing[0].id}).`,
    });

    const updated = await db
      .select()
      .from(dbBlogs)
      .where(eq(dbBlogs.id, existing[0].id));

    return NextResponse.json(updated[0]);
  } catch (error) {
    console.error('Update blog post error:', error);
    return NextResponse.json({ error: 'Internal server error updating blog article.' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const admin = await getAuthAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized admin access.' }, { status: 401 });
    }

    const { slug: id } = await params;
    const existing = await db
      .select()
      .from(dbBlogs)
      .where(or(eq(dbBlogs.id, id), eq(dbBlogs.slug, id)));

    const deletedBlog = existing[0];

    if (deletedBlog) {
      await db.delete(dbBlogs).where(eq(dbBlogs.id, deletedBlog.id));

      const logId = 'log-' + Math.floor(100000 + Math.random() * 900000);
      await db.insert(dbActivityLogs).values({
        id: logId,
        timestamp: new Date(),
        adminUsername: admin.username,
        adminRole: admin.role,
        action: 'Deleted Blog Post',
        details: `Deleted health article "${(deletedBlog.en as any)?.seoTitle || 'No Title'}" (ID: ${deletedBlog.id}) from database.`,
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Blog post not found.' }, { status: 404 });
  } catch (error) {
    console.error('Delete blog post error:', error);
    return NextResponse.json({ error: 'Internal server error removing blog article.' }, { status: 500 });
  }
}
