import { BlogPost } from '../types';

export const blogPosts: BlogPost[] = [
  {
    id: "why-donate-blood",
    slug: "why-should-you-donate-blood-bangladesh",
    category: "Health & Science",
    tags: ["Save Lives", "Community", "Bangladesh", "Health Tips"],
    featuredImageIdea: "A smiling volunteer in Dhaka receiving a blood donation certificate, surrounded by supportive medical staff in a clean facility.",
    en: {
      seoTitle: "Why Should You Donate Blood? The Ultimate Lifesaving Decision | DonateLife BD",
      metaTitle: "Why Should You Donate Blood? Lifesaving Impact & Health Benefits",
      metaDescription: "Discover why donating blood is the single most noble, healthy, and critical decision you can make today in Bangladesh. Learn about the impact of your gift.",
      introduction: "Every day, thousands of patients across Bangladesh require urgent blood transfusions due to emergencies, childbirth, surgeries, and chronic illnesses like thalassemia. Despite this massive demand, our voluntary donation rate remains low, forcing families of patients to scramble during critical hours. When you choose to donate blood through DonateLife BD, you are not just giving a fluid; you are gifting someone another chance at life.",
      tableOfContents: [
        { label: "The Critical Blood Shortage in Bangladesh", anchor: "shortage" },
        { label: "The Human Impact: Who You Are Actually Saving", anchor: "impact" },
        { label: "Surprising Personal Health Benefits", anchor: "benefits" },
        { label: "Overcoming the Psychological Barrier", anchor: "psychology" },
        { label: "The Call to Action for Every Bangladeshi citizen", anchor: "cta" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "The Critical Blood Shortage in Bangladesh",
          text: "In Bangladesh, there is an estimated annual demand of over 1,000,000 units of blood, yet voluntary blood donations cover only a small portion of this requirement. The remainder must be managed through replacement donors (friends and family) or professional donors, which can sometimes pose safety risks. This gap exists primarily due to a lack of awareness, fear of needles, and misconceptions about the physical effects of donation. DonateLife BD aims to bridge this gap by connecting active voluntary donors with those in emergency situations."
        },
        {
          type: "h3",
          heading: "Why Voluntary Donors Are the Gold Standard",
          text: "Voluntary, non-remunerated blood donors are proven to be the safest source of blood. Unlike replacement or paid donors who might withhold their medical histories due to pressure or financial incentives, voluntary donors act purely out of altruism. Their blood undergoes rigorous screening, ensuring maximum safety for the fragile recipient."
        },
        {
          type: "h2",
          heading: "The Human Impact: Who You Are Actually Saving",
          text: "A single bag of whole blood (approximately 350-450 ml) can be separated into three main components: Red Blood Cells (RBCs), Platelets, and Plasma. This means that one single voluntary donation has the potential to save up to three lives. Let's look at who depends on your generous gift:"
        },
        {
          type: "bullet",
          items: [
            "Mothers experiencing severe bleeding (postpartum hemorrhage) during childbirth—a leading cause of maternal mortality in rural Bangladesh.",
            "Newborn babies and premature infants suffering from severe anemia or respiratory distress.",
            "Thalassemia patients who require regular blood transfusions every 2 to 4 weeks to survive.",
            "Accident and trauma victims who suffer sudden, massive blood loss on our national highways.",
            "Cancer patients undergoing aggressive chemotherapy sessions that destroy their bone marrow."
          ]
        },
        {
          type: "callout",
          text: "Medical Insight: Postpartum hemorrhage is a critical emergency. Access to safe blood within 30 minutes can represent the thin line between survival and tragedy for a new mother."
        },
        {
          type: "h2",
          heading: "Surprising Personal Health Benefits of Blood Donation",
          text: "While the primary motivation for blood donation is humanitarian, clinical studies show that donors also gain significant physiological and psychological health benefits. Giving blood regularly acts as a natural maintenance system for your cardiovascular health."
        },
        {
          type: "table",
          tableHeaders: ["Health Indicator", "How Blood Donation Benefits It", "Clinical Frequency"],
          tableRows: [
            ["Iron Level Regulation", "Reduces excess iron accumulation in the blood, preventing oxidative damage to arteries.", "Every 3-4 Months"],
            ["Cardiovascular Health", "Improves blood flow velocity and reduces arterial blockages, lowering the risk of heart attacks.", "Regular Donors"],
            ["Mini Health Checkup", "Provides free clinical screening for Hemoglobin levels, Blood Pressure, Pulse, and 5 major infectious diseases.", "Every Donation"],
            ["Caloric Burn", "The body expends energy (around 650 calories) to synthesize new red blood cells to replace the donated volume.", "Within 48 hours"]
          ]
        },
        {
          type: "h2",
          heading: "Overcoming the Psychological Barrier",
          text: "Many people in Bangladesh want to donate blood but are held back by fear. The fear of pain, the fear of fainting, or the belief that donation makes one permanently weak are common. In reality, the actual blood collection process takes only 8 to 10 minutes. The pinch of the needle is comparable to a simple mosquito bite, and your body fully replaces the lost blood volume (plasma) within 48 hours. The sense of fulfillment and joy after knowing you saved a child's life is the ultimate emotional reward."
        }
      ],
      faqs: [
        {
          question: "Is donating blood painful?",
          answer: "Not at all. You will feel a quick, minor pinch when the needle is inserted, which lasts only a second. The rest of the process is completely painless and supervised by certified professionals."
        },
        {
          question: "How long does it take for my body to recover the lost blood?",
          answer: "Your body replenishes the fluid volume (plasma) within 24 to 48 hours. Your red blood cells are completely replaced by your bone marrow within 4 to 8 weeks."
        }
      ],
      conclusion: "Blood donation is the ultimate act of humanity. By sparing just 15 minutes of your day, you can rewrite the future of a family in distress. Let us make Bangladesh a self-sufficient nation in safe blood reserves.",
      cta: "Become a registered voluntary donor on DonateLife BD today. Your single registration could be the reason someone gets to see tomorrow."
    },
    bn: {
      seoTitle: "রক্তদান কেন করবেন? একটি জীবন রক্ষাকারী সিদ্ধান্ত | DonateLife BD",
      metaTitle: "রক্তদান কেন করবেন? রক্তদানের প্রয়োজনীয়তা ও স্বাস্থ্যগত উপকারিতা",
      metaDescription: "জানুন কেন রক্তদান বাংলাদেশে সবচেয়ে মহৎ, স্বাস্থ্যকর এবং অত্যন্ত গুরুত্বপূর্ণ একটি সিদ্ধান্ত। আপনার এই উপহার কীভাবে জীবন বাঁচায় তা বিস্তারিত পড়ুন।",
      introduction: "বাংলাদেশে প্রতিদিন হাজার হাজার রোগীর জরুরী অস্ত্রোপচার, সন্তান প্রসব, দুর্ঘটনা বা থ্যালাসেমিয়ার মতো দীর্ঘস্থায়ী রোগের কারণে রক্তের প্রয়োজন হয়। এই বিশাল চাহিদার বিপরীতে স্বেচ্ছায় রক্তদাতার সংখ্যা এখনো অনেক কম। যখন আপনি DonateLife BD-এর মাধ্যমে রক্তদান করার সিদ্ধান্ত নেন, তখন আপনি কেবল রক্ত দিচ্ছেন না; বরং একজনকে বেঁচে থাকার নতুন আশা দিচ্ছেন।",
      tableOfContents: [
        { label: "বাংলাদেশে রক্তের তীব্র সংকট", anchor: "shortage" },
        { label: "মানবিক প্রভাব: আপনি কাদের জীবন বাঁচাচ্ছেন", anchor: "impact" },
        { label: "রক্তদাতার চমৎকার স্বাস্থ্যগত সুবিধা", anchor: "benefits" },
        { label: "মানসিক ভয় কাটিয়ে ওঠার উপায়", anchor: "psychology" },
        { label: "প্রত্যেক বাংলাদেশী নাগরিকের প্রতি আহ্বান", anchor: "cta" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "বাংলাদেশে রক্তের তীব্র সংকট",
          text: "বাংলাদেশে প্রতি বছর প্রায় ১০ লক্ষ ব্যাগ রক্তের প্রয়োজন হয়, যার একটি বড় অংশই মেটানো সম্ভব হয় না নিয়মিত স্বেচ্ছাসেবী রক্তদাতাদের অভাবে। এই ঘাটতির কারণে রোগীর স্বজনদের জরুরী মুহূর্তে রক্তের জন্য এক হাসপাতাল থেকে অন্য হাসপাতালে ছুটতে হয়। DonateLife BD এই প্রযুক্তিগত ব্যবধান দূর করে সরাসরি স্বেচ্ছাসেবী রক্তদাতাদের সাথে গ্রহীতাকে যুক্ত করে।"
        },
        {
          type: "h3",
          heading: "কেন স্বেচ্ছাসেবী রক্তদাতারা রক্তের সেরা উৎস?",
          text: "স্বেচ্ছাসেবী ও বিনামূল্যে রক্তদানকারী ব্যক্তিরাই রক্তের সবচেয়ে নিরাপদ উৎস। কোনো চাপ বা আর্থিক প্রলোভন ছাড়া সম্পূর্ণ নিজের ইচ্ছায় রক্ত দেওয়ায় তাদের রক্তে কোনো গোপন রোগ থাকার সম্ভাবনা থাকে না। তাদের রক্ত অত্যন্ত সতর্কতার সাথে পরীক্ষা করা হয়।"
        },
        {
          type: "h2",
          heading: "মানবিক প্রভাব: আপনি কাদের জীবন বাঁচাচ্ছেন",
          text: "আপনার দান করা এক ব্যাগ রক্তকে তিনটি প্রধান উপাদানে বিভক্ত করা যায়: লোহিত রক্তকণিকা (RBC), প্লেটলেট এবং প্লাজমা। এর মানে হলো আপনার একটি মাত্র রক্তদান অনায়াসে তিনজন মুমূর্ষু রোগীর প্রাণ বাঁচাতে পারে। চলুন দেখে নেওয়া যাক আপনার এই উপহার কাদের সাহায্য করে:"
        },
        {
          type: "bullet",
          items: [
            "প্রসবকালীন অতিরিক্ত রক্তক্ষরণে আক্রান্ত মায়েরা—যা আমাদের দেশের গ্রামীণ এলাকায় মাতৃমৃত্যুর অন্যতম প্রধান কারণ।",
            "মারাত্মক রক্তাল্পতা বা শ্বাসকষ্টে ভুগতে থাকা সদ্যভূমিষ্ঠ ও অকালজাত শিশুরা।",
            "থ্যালাসেমিয়া আক্রান্ত রোগীরা যাদের প্রতি ২ থেকে ৪ সপ্তাহ পর পর বেঁচে থাকার জন্য নিয়মিত রক্ত নিতে হয়।",
            "সড়ক দুর্ঘটনায় হঠাৎ অতিরিক্ত রক্তক্ষরণে আক্রান্ত ব্যক্তিরা।",
            "ক্যান্সার আক্রান্ত রোগীরা যাদের কেমোথেরাপির কারণে অস্থিমজ্জা ক্ষতিগ্রস্ত হয়।"
          ]
        },
        {
          type: "callout",
          text: "চিকিৎসকের পরামর্শ: প্রসবকালীন রক্তক্ষরণ একটি মারাত্মক জরুরী অবস্থা। ৩০ মিনিটের মধ্যে নিরাপদ রক্ত সরবরাহ নিশ্চিত করা একটি মায়ের জীবন বাঁচানোর অন্যতম প্রধান চাবিকাঠি।"
        },
        {
          type: "h2",
          heading: "রক্তদাতার চমৎকার স্বাস্থ্যগত সুবিধা",
          text: "রক্তদান কেবল অপরের উপকার করে না, নিয়মিত রক্ত দিলে রক্তদাতার নিজের শরীরেও চমৎকার সব ইতিবাচক পরিবর্তন আসে। এটি আপনার হৃদরোগের ঝুঁকি কমাতে এবং শরীরের রক্ত সঞ্চালন ভালো রাখতে সাহায্য করে।"
        },
        {
          type: "table",
          tableHeaders: ["স্বাস্থ্য নির্দেশক", "রক্তদানের উপকারিতা", "প্রয়োজনীয় সময়কাল"],
          tableRows: [
            ["আয়রনের ভারসাম্য রক্ষা", "রক্তে অতিরিক্ত আয়রনের পরিমাণ কমিয়ে হৃদরোগ এবং ধমনী ক্ষতিগ্রস্ত হওয়ার ঝুঁকি হ্রাস করে।", "প্রতি ৩-৪ মাস অন্তর"],
            ["হৃদযন্ত্রের সুস্থতা", "রক্তের ঘনত্ব কমিয়ে রক্তনালীর ব্লকেজ প্রতিরোধ করে এবং রক্ত সঞ্চালন সচল রাখে।", "নিয়মিত রক্তদাতাদের জন্য"],
            ["ফ্রি মিনি স্বাস্থ্য পরীক্ষা", "রক্তদানের পূর্বে বিনামূল্যে হিমোগ্লোবিন, রক্তচাপ, পালস এবং ৫টি প্রধান সংক্রামক রোগের স্ক্রিনিং করা হয়।", "প্রতিটি রক্তদানে"],
            ["ক্যালোরি ক্ষয়", "নতুন রক্তকণিকা তৈরিতে শরীর প্রচুর শক্তি ব্যয় করে, যার ফলে রক্তদানের ৪৮ ঘণ্টার মধ্যে প্রায় ৬৫০ ক্যালোরি ক্ষয় হয়।", "৪৮ ঘণ্টার মধ্যে"]
          ]
        },
        {
          type: "h2",
          heading: "মানসিক ভয় কাটিয়ে ওঠার উপায়",
          text: "আমাদের দেশের অনেক মানুষ রক্ত দিতে চান কিন্তু সুঁইয়ের ভয় বা রক্ত দিলে দুর্বল হয়ে যাওয়ার আশঙ্কায় পিছিয়ে যান। কিন্তু জেনে রাখা ভালো, পুরো রক্তদান প্রক্রিয়ায় মাত্র ৮ থেকে ১০ মিনিট সময় লাগে। সুঁই ফুটার অনুভূতি একটি সামান্য মশার কামড়ের মতো। আর আপনার শরীর মাত্র ৪৮ ঘণ্টার মধ্যে দান করা তরল অংশটুকু (প্লাজমা) পূরণ করে ফেলে।"
        }
      ],
      faqs: [
        {
          question: "রক্ত দিলে কি ব্যথা লাগে?",
          answer: "একেবারেই না। সুঁই ঢোকানোর সময় সামান্য মশার কামড়ের মতো একটি অনুভূতি হবে যা এক সেকেন্ডের জন্য স্থায়ী হয়। পুরো প্রক্রিয়াটি সম্পূর্ণ নিরাপদ এবং অভিজ্ঞ নার্স দ্বারা সম্পন্ন হয়।"
        },
        {
          question: "শরীর পুনরায় রক্ত তৈরি করতে কতদিন সময় নেয়?",
          answer: "আপনার শরীর ২৪ থেকে ৪৮ ঘণ্টার মধ্যে রক্তের তরল অংশ (প্লাজমা) পূরণ করে ফেলে। আর লোহিত রক্তকণিকাগুলো ৪ থেকে ৮ সপ্তাহের মধ্যে সম্পূর্ণ নতুনভাবে তৈরি হয়।"
        }
      ],
      conclusion: "রক্তদান হলো মানবতার সর্বোচ্চ রূপ। আপনার জীবনের মাত্র ১৫ মিনিট সময় দিয়ে একটি পরিবারের বুক খালি হওয়া রক্ষা করতে পারেন। আসুন আমরা রক্তদানে স্বয়ংসম্পূর্ণ বাংলাদেশ গড়ে তুলি।",
      cta: "আজই DonateLife BD-তে একজন স্বেচ্ছাসেবী রক্তদাতা হিসেবে নিবন্ধন করুন। আপনার এই একটি সিদ্ধান্ত হয়তো কাল কারো বেঁচে থাকার কারণ হবে।"
    }
  },
  {
    id: "benefits-of-blood-donation",
    slug: "health-benefits-of-blood-donation",
    category: "Health & Science",
    tags: ["Health Benefits", "Heart Health", "Wellness"],
    featuredImageIdea: "An artistic anatomical representation of a glowing healthy heart connected to a dynamic, clean blood flow loop with modern UI elements.",
    en: {
      seoTitle: "8 Proven Health Benefits of Regular Blood Donation | DonateLife BD",
      metaTitle: "8 Health Benefits of Blood Donation - Verified Medical Facts",
      metaDescription: "Did you know blood donation helps your heart, lowers cancer risk, and cleanses your body? Explore the scientifically proven health benefits of regular donation.",
      introduction: "When you hear about blood donation, you usually think about the person receiving it. But scientific studies have conclusively shown that regular blood donors also receive outstanding health benefits. In this guide, we break down how donating blood regularly acts as a natural body-detox system, enhancing your life expectancy and cardiovascular health.",
      tableOfContents: [
        { label: "1. Prevention of Hemochromatosis", anchor: "hemochromatosis" },
        { label: "2. Reducing the Risk of Heart Attacks", anchor: "heart-attack" },
        { label: "3. Lowering the Risk of Cancer", anchor: "cancer-risk" },
        { label: "4. Stimulation of New Blood Cell Production", anchor: "new-cells" },
        { label: "5. Free Complete Diagnostic Panel", anchor: "free-screening" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "1. Prevention of Hemochromatosis",
          text: "Hemochromatosis is a genetic condition where the body absorbs too much iron from food. Over time, excess iron deposits in vital organs like the liver, heart, and pancreas, leading to life-threatening complications. Regular blood donation is the primary clinical therapy to lower iron stores, maintaining them at optimal, non-toxic levels."
        },
        {
          type: "h2",
          heading: "2. Reducing the Risk of Heart Attacks and Strokes",
          text: "High iron levels in the blood speed up the oxidation of cholesterol. This oxidized cholesterol deposits inside arterial walls, causing them to harden and narrow (atherosclerosis). Regular blood donation thins the blood naturally, allowing it to flow smoother through blood vessels. This dramatically reduces the likelihood of arterial blockage, lowering the risk of heart attacks and strokes by up to 33%."
        },
        {
          type: "h2",
          heading: "3. Lowering the Risk of Cancer",
          text: "According to a study published in the Journal of the National Cancer Institute, high systemic iron levels are linked to increased cancer-causing free radicals in the body. By donating blood and keeping your body's iron stores well-balanced, you significantly reduce oxidative stress, which is linked to lower rates of liver, colon, lung, and throat cancers."
        },
        {
          type: "h2",
          heading: "4. Stimulation of New Blood Cell Production",
          text: "Within 48 hours of donating blood, your body detects the slight drop in oxygen-carrying capacity and triggers the release of erythropoietin, a hormone produced by the kidneys. This hormone stimulates your bone marrow to produce fresh, highly functional red blood cells. These new cells are more efficient at carrying oxygen throughout your body, leaving you feeling re-energized."
        },
        {
          type: "h2",
          heading: "5. Free Complete Diagnostic Panel",
          text: "Before every donation on DonateLife BD, you receive a free mini-medical checkup. We test your blood pressure, temperature, heart rate, and hemoglobin levels. Additionally, your blood is screened in the lab for five high-priority transfusion-transmissible infections:"
        },
        {
          type: "bullet",
          items: [
            "Hepatitis B (HBV)",
            "Hepatitis C (HCV)",
            "Human Immunodeficiency Virus (HIV)",
            "Syphilis (VDRL)",
            "Malaria"
          ]
        },
        {
          type: "callout",
          text: "Financial Value: If performed independently at a private diagnostic clinic in Dhaka, this panel of tests would cost between BDT 2,500 to 4,000. As a voluntary donor, you receive this screening completely free of cost."
        }
      ],
      faqs: [
        {
          question: "Can regular blood donation help with weight loss?",
          answer: "While it burns about 650 calories per donation as your body works to regenerate cells, blood donation should never be treated as a weight-loss program. It is simply a helpful, energetic byproduct of a noble deed."
        },
        {
          question: "How often can I donate to get these health benefits?",
          answer: "Healthy male donors can safely donate whole blood every 3 months (90 days), while healthy female donors can donate every 4 months (120 days)."
        }
      ],
      conclusion: "Donating blood is a win-win situation. It is an extraordinary act of kindness that pays rich dividends back to your own cardiovascular and metabolic system. Keep your heart strong by giving life to others.",
      cta: "Join DonateLife BD as a regular donor and monitor your free screening health logs while saving lives."
    },
    bn: {
      seoTitle: "নিয়মিত রক্তদানের ৮টি বৈজ্ঞানিক স্বাস্থ্যগত উপকারিতা | DonateLife BD",
      metaTitle: "রক্তদানের উপকারিতা - চিকিৎসাবিজ্ঞান দ্বারা প্রমাণিত ৮টি তথ্য",
      metaDescription: "আপনি কি জানেন রক্তদান আপনার হার্ট ভালো রাখে, ক্যান্সারের ঝুঁকি কমায় এবং শরীরকে ডিটক্স করে? নিয়মিত রক্তদানের বৈজ্ঞানিক উপকারিতাগুলো জানুন।",
      introduction: "আমরা যখন রক্তদানের কথা শুনি, তখন সাধারণত আমাদের মনে কেবল রোগীর কথাই ভেসে ওঠে। কিন্তু চিকিৎসাবিজ্ঞানের একাধিক গবেষণায় দেখা গেছে যে রক্তদাতারাও রক্তদানের মাধ্যমে অসাধারণ কিছু স্বাস্থ্যগত সুবিধা পেয়ে থাকেন। এই নির্দেশিকায় আমরা আলোচনা করব কীভাবে নিয়মিত রক্তদান আপনার শরীরকে প্রাকৃতিকভাবে সুস্থ রাখতে সাহায্য করে।",
      tableOfContents: [
        { label: "১. হেমোক্রোমাটোসিস বা অতিরিক্ত আয়রন প্রতিরোধ", anchor: "hemochromatosis" },
        { label: "২. হার্ট অ্যাটাক ও স্ট্রোকের ঝুঁকি কমানো", anchor: "heart-attack" },
        { label: "৩. ক্যান্সারের ঝুঁকি হ্রাস করা", anchor: "cancer-risk" },
        { label: "৪. নতুন রক্তকণিকা তৈরিতে উদ্দীপনা", anchor: "new-cells" },
        { label: "৫. সম্পূর্ণ বিনামূল্যে মিনি স্বাস্থ্য পরীক্ষা", anchor: "free-screening" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "১. হেমোক্রোমাটোসিস বা অতিরিক্ত আয়রন প্রতিরোধ",
          text: "হেমোক্রোমাটোসিস হলো একটি জেনেটিক সমস্যা যেখানে শরীর খাবার থেকে অতিরিক্ত আয়রন শোষণ করে। এই অতিরিক্ত আয়রন হৃৎপিণ্ড, যকৃত এবং অগ্ন্যাশয়ে জমা হয়ে মারাত্মক ক্ষতি করতে পারে। নিয়মিত রক্তদান করলে শরীর থেকে অতিরিক্ত আয়রন বের হয়ে যায় এবং আয়রনের মাত্রা নিয়ন্ত্রণে থাকে।"
        },
        {
          type: "h2",
          heading: "২. হার্ট অ্যাটাক ও স্ট্রোকের ঝুঁকি কমানো",
          text: "রক্তে অতিরিক্ত আয়রন থাকলে তা কোলেস্টেরলকে জারিত করে। এই জারিত কোলেস্টেরল ধমনীর গায়ে জমা হয়ে রক্তনালীকে সংকুচিত করে তোলে। নিয়মিত রক্তদান করলে রক্তের সান্দ্রতা (ঘনত্ব) কমে যায়, যার ফলে রক্তনালীতে ব্লকেজ তৈরির ঝুঁকি হ্রাস পায়। গবেষণায় দেখা গেছে, নিয়মিত রক্তদাতাদের হার্ট অ্যাটাকের ঝুঁকি প্রায় ৩৩% কমে যায়।"
        },
        {
          type: "h2",
          heading: "৩. ক্যান্সারের ঝুঁকি হ্রাস করা",
          text: "ন্যাশনাল ক্যান্সার ইনস্টিটিউটের জার্নালে প্রকাশিত একটি গবেষণায় দেখা গেছে, শরীরে আয়রনের মাত্রা অতিরিক্ত বেশি থাকলে তা ক্যান্সার সৃষ্টিকারী ফ্রি র‍্যাডিক্যাল তৈরি করতে পারে। রক্তদানের মাধ্যমে আয়রনের ভারসাম্য বজায় রাখলে ফুসফুস, লিভার ও কোলন ক্যান্সারের ঝুঁকি উল্লেখযোগ্যভাবে কমে যায়।"
        },
        {
          type: "h2",
          heading: "৪. নতুন রক্তকণিকা তৈরিতে উদ্দীপনা",
          text: "রক্ত দেওয়ার ৪৮ ঘণ্টার মধ্যে শরীর রক্তের পরিমাণ কমে যাওয়া টের পায় এবং কিডনি থেকে ইরিথ্রোপয়েটিন নামক হরমোন নিঃসৃত হয়। এই হরমোন আপনার অস্থিমজ্জাকে (Bone Marrow) নতুন ও অত্যন্ত কার্যক্ষম লোহিত রক্তকণিকা তৈরি করতে উদ্বুদ্ধ করে। এর ফলে শরীরে নতুন শক্তির সঞ্চার হয়।"
        },
        {
          type: "h2",
          heading: "৫. সম্পূর্ণ বিনামূল্যে মিনি স্বাস্থ্য পরীক্ষা",
          text: "DonateLife BD-এর মাধ্যমে প্রতিবার রক্তদানের পূর্বে আপনার একটি সংক্ষিপ্ত স্বাস্থ্য পরীক্ষা করা হয়। যেখানে আপনার রক্তচাপ, শরীরের তাপমাত্রা, পালস রেট এবং হিমোগ্লোবিনের মাত্রা মাপা হয়। এছাড়া ল্যাবরেটরিতে আপনার রক্তে ৫টি মারাত্মক ছোঁয়াচে রোগ পরীক্ষা করা হয়:"
        },
        {
          type: "bullet",
          items: [
            "হেপাটাইটিস বি (HBV)",
            "হেপাটাইটিস সি (HCV)",
            "এইচআইভি বা এইডস (HIV)",
            "সিফিলিস (VDRL)",
            "ম্যালেরিয়া"
          ]
        },
        {
          type: "callout",
          text: "আর্থিক সাশ্রয়: ঢাকার যেকোনো নামী ডায়াগনস্টিক সেন্টারে এই ৫টি পরীক্ষা করতে প্রায় ২,৫০০ থেকে ৪,০০০ টাকা খরচ হয়। স্বেচ্ছাসেবী রক্তদাতা হিসেবে আপনি প্রতিবার রক্তদানে এই পরীক্ষাগুলো সম্পূর্ণ বিনামূল্যে পাচ্ছেন।"
        }
      ],
      faqs: [
        {
          question: "রক্ত দিলে কি ওজন কমে?",
          answer: "রক্ত দেওয়ার পর শরীর যখন নতুন রক্তকণিকা তৈরি করে, তখন প্রায় ৬৫০ ক্যালোরি শক্তি ক্ষয় হয়। তবে এটিকে ওজন কমানোর ব্যায়াম বা ডায়েটের বিকল্প হিসেবে নেওয়া যাবে না; এটি কেবল রক্তদানের একটি ইতিবাচক পার্শ্বপ্রতিক্রিয়া।"
        },
        {
          question: "উপকারিতা পেতে আমি কতদিন পর পর রক্ত দিতে পারব?",
          answer: "যেকোনো সুস্থ পুরুষ প্রতি ৩ মাস পর পর (৯০ দিন) এবং যেকোনো সুস্থ নারী প্রতি ৪ মাস পর পর (১২০ দিন) নিরাপদে রক্ত দিতে পারেন।"
        }
      ],
      conclusion: "রক্তদান একটি অনন্য মানবিক কাজ যা আপনার নিজের শরীরকেও সুস্থ রাখে। অন্যকে জীবন দান করে নিজের হার্টকে রাখুন সতেজ ও প্রাণবন্ত।",
      cta: "আজই DonateLife BD-তে একজন নিয়মিত রক্তদাতা হিসেবে যুক্ত হোন এবং আপনার বিনামূল্যে করা পরীক্ষাগুলোর রিপোর্ট ট্র্যাক করুন।"
    }
  },
  {
    id: "who-can-donate-blood",
    slug: "blood-donation-eligibility-criteria",
    category: "Donor Guidelines",
    tags: ["Eligibility", "Health Guidelines", "Donor Requirements"],
    featuredImageIdea: "A clear infographics display showing icons for weight scale, age card, blood pressure gauge, and thermometer in a sleek flat design.",
    en: {
      seoTitle: "Who Can Donate Blood? Complete Eligibility Criteria | DonateLife BD",
      metaTitle: "Who Can Donate Blood? Complete Eligibility Guidelines",
      metaDescription: "Are you eligible to donate blood? Learn about the standard age, weight, and health requirements for blood donors in Bangladesh. Check your status.",
      introduction: "Many eager people in Bangladesh want to save lives by donating blood, but are unsure whether they meet the clinical requirements. Donor selection rules are strictly designed to protect both the donor from physical stress and the recipient from infectious diseases. Let us evaluate the medical eligibility criteria step-by-step so you can prepare for your donation confidently.",
      tableOfContents: [
        { label: "Basic Age and Weight Standards", anchor: "basics" },
        { label: "Vital Health Signs Requirements", anchor: "vitals" },
        { label: "Medical History and Travel Restrictions", anchor: "history" },
        { label: "Lifestyle Factors and Tattoos", anchor: "lifestyle" },
        { label: "The Checkbox Test Before Donating", anchor: "test" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "Basic Age and Weight Standards",
          text: "Before undergoing detailed medical screening, there are two primary physical requirements that every candidate must meet:"
        },
        {
          type: "bullet",
          items: [
            "Age Range: You must be between 18 and 60 years of age. Some medical bodies accept regular donors up to 65 years with special consultant clearance.",
            "Minimum Weight: You must weigh at least 45 kg (99 lbs) for a standard whole blood donation (350 ml). For a 450 ml donation, most centers in Bangladesh require a minimum weight of 50 kg (110 lbs) to ensure safe blood volume recovery."
          ]
        },
        {
          type: "h2",
          heading: "Vital Health Signs Requirements",
          text: "On the day of your donation, our medical officer at DonateLife BD or the hospital clinic will measure your vitals. These values must lie within these strict healthy ranges:"
        },
        {
          type: "table",
          tableHeaders: ["Vital Sign Parameter", "Acceptable Safe Range", "Why it Matters"],
          tableRows: [
            ["Hemoglobin Level", "Min 12.5 g/dL for females | Min 13.0 g/dL for males", "Prevents donor from developing post-donation anemia."],
            ["Blood Pressure", "Systolic: 90 - 140 mmHg | Diastolic: 60 - 90 mmHg", "Ensures cardiovascular stability during rapid blood withdrawal."],
            ["Pulse Rate", "60 to 100 beats per minute (regular rhythm)", "Indicates a resting, healthy cardiac function."],
            ["Body Temperature", "Oral temperature must not exceed 37.5°C (99.5°F)", "Excludes active low-grade infections or fevers."]
          ]
        },
        {
          type: "h2",
          heading: "Medical History and Travel Restrictions",
          text: "Even if your vital signs are pristine, certain temporary medical conditions will postpone your donation. This delay is called a 'deferral period' to ensure your system recovers completely:"
        },
        {
          type: "bullet",
          items: [
            "Common Cold/Flu: Postpone donation until 7 days after all symptoms have completely cleared.",
            "Antibiotic Course: Wait 7 to 14 days after finishing your last dose of antibiotics to ensure the bacterial infection is fully eliminated.",
            "Minor Surgeries: Defer donation for 3 to 6 months depending on the procedure and healing process.",
            "Major Dental Procedures: Wait 24 to 72 hours due to the risk of transient oral bacteria entering the bloodstream."
          ]
        },
        {
          type: "callout",
          text: "Important Notice: If you have recently traveled to a malaria-endemic region within Bangladesh (such as certain hill tracts of Bandarban, Khagrachhari, or Rangamati), you must declare it to our medical officer. A temporary deferral of 3 to 12 months may apply."
        }
      ],
      faqs: [
        {
          question: "Can I donate blood if I have high blood pressure?",
          answer: "Yes, provided your blood pressure is stable and well-controlled within the safe limit (below 140/90) on the day of donation, even if you are taking blood pressure medications."
        },
        {
          question: "Can diabetics donate blood?",
          answer: "Diabetic individuals who manage their blood sugar through oral medications or diet can safely donate. Those who require insulin injections are usually deferred to prevent hypoglycemia."
        }
      ],
      conclusion: "Most healthy adults can easily meet these eligibility requirements. If you fulfill these conditions, you have an incredible power to save lives flowing through your veins.",
      cta: "Take the eligibility self-assessment on DonateLife BD and schedule your voluntary donation today."
    },
    bn: {
      seoTitle: "কে রক্ত দিতে পারবেন? রক্তদানের শারীরিক যোগ্যতা | DonateLife BD",
      metaTitle: "রক্তদানের যোগ্যতা ও নিয়মাবলী - বিস্তারিত নির্দেশিকা",
      metaDescription: "আপনি কি রক্ত দিতে পারবেন? বাংলাদেশে রক্তদানের জন্য বয়স, ওজন ও স্বাস্থ্য সংক্রান্ত প্রয়োজনীয় নিয়মাবলী জেনে নিন। আপনার যোগ্যতা পরীক্ষা করুন।",
      introduction: "বাংলাদেশের অনেক মানুষেরই রক্ত দিয়ে অন্যের জীবন বাঁচানোর প্রবল ইচ্ছা থাকে, কিন্তু তারা নিশ্চিত নন যে তারা শারীরিকভাবে রক্ত দেওয়ার উপযুক্ত কিনা। রক্তদাতার যোগ্যতা যাচাই করার নিয়মগুলো রক্তদাতার নিজের এবং রক্ত গ্রহণকারী রোগীর নিরাপত্তা রক্ষার জন্যই তৈরি করা হয়েছে। চলুন রক্তদানের যোগ্যতাগুলো ধাপে ধাপে জেনে নেই।",
      tableOfContents: [
        { label: "বয়স এবং ওজনের সাধারণ মাপকাঠি", anchor: "basics" },
        { label: "গুরুত্বপূর্ণ শারীরিক সূচক বা ভাইটালস", anchor: "vitals" },
        { label: "চিকিৎসাগত ইতিহাস ও সাময়িক বাধা", anchor: "history" },
        { label: "জীবনযাত্রা ও ট্যাটু সংক্রান্ত নিয়ম", anchor: "lifestyle" },
        { label: "রক্তদানের পূর্ববর্তী দ্রুত চেকলিস্ট", anchor: "test" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "বয়স এবং ওজনের সাধারণ মাপকাঠি",
          text: "বিস্তারিত স্বাস্থ্য পরীক্ষার পূর্বে প্রাথমিকভাবে একজন রক্তদাতার দুটি প্রধান শারীরিক যোগ্যতা থাকতে হবে:"
        },
        {
          type: "bullet",
          items: [
            "বয়সসীমা: রক্তদাতার বয়স অবশ্যই ১৮ থেকে ৬০ বছরের মধ্যে হতে হবে। নিয়মিত রক্তদাতাদের ক্ষেত্রে চিকিৎসকের পরামর্শ অনুযায়ী ৬৫ বছর পর্যন্ত রক্ত নেওয়া যেতে পারে।",
            "নূন্যতম ওজন: ৩৫০ মিলি রক্ত দেওয়ার জন্য রক্তদাতার ওজন কমপক্ষে ৪৫ কেজি হতে হবে। তবে বাংলাদেশে সাধারণত ৪০০-৪৫০ মিলি রক্ত নেওয়ার জন্য নূন্যতম ওজন ৫০ কেজি হওয়া বাঞ্ছনীয়।"
          ]
        },
        {
          type: "h2",
          heading: "গুরুত্বপূর্ণ শারীরিক সূচক বা ভাইটালস",
          text: "রক্তদানের দিন DonateLife BD বা হাসপাতালের দায়িত্বরত মেডিকেল অফিসার আপনার কিছু প্রাথমিক স্বাস্থ্য পরীক্ষা করবেন, যার মান নিম্নোক্ত সীমার মধ্যে থাকতে হবে:"
        },
        {
          type: "table",
          tableHeaders: ["শারীরিক নির্দেশক", "নিরাপদ মাত্রা বা রেঞ্জ", "কেন এটি গুরুত্বপূর্ণ"],
          tableRows: [
            ["হিমোগ্লোবিনের মাত্রা", "নারীদের জন্য নূন্যতম ১২.৫ g/dL | পুরুষদের জন্য নূন্যতম ১৩.০ g/dL", "রক্তদানের পর রক্তদাতার শরীরে রক্তাল্পতা প্রতিরোধ করে।"],
            ["রক্তচাপ (BP)", "সিস্টোলিক: ৯০ - ১৪০ mmHg | ডায়াস্টোলিক: ৬০ - ৯০ mmHg", "রক্তদানের সময় রক্ত সঞ্চালন স্বাভাবিক রাখতে সাহায্য করে।"],
            ["পালস রেট", "প্রতি মিনিটে ৬০ থেকে ১০০ বার (স্বাভাবিক ছন্দ)", "হৃদযন্ত্রের সুস্থ ও স্বাভাবিক কার্যকারিতা নির্দেশ করে।"],
            ["শরীরের তাপমাত্রা", "মুখের তাপমাত্রা অবশ্যই ৩৭.৫°C (৯৯.৫°F) এর নিচে হতে হবে", "শরীরে সক্রিয় কোনো জ্বর বা ইনফেকশন নেই তা নিশ্চিত করে।"]
          ]
        },
        {
          type: "h2",
          heading: "চিকিৎসাগত ইতিহাস ও সাময়িক বাধা",
          text: "আপনার ভাইটাল সাইন স্বাভাবিক থাকলেও সাময়িক কিছু শারীরিক অবস্থার কারণে রক্তদান কিছুদিন পিছিয়ে দিতে হতে পারে, যাকে 'সাময়িক বিরতি' বলা হয়:"
        },
        {
          type: "bullet",
          items: [
            "সাধারণ সর্দি-কাশি/জ্বর: সব লক্ষণ পুরোপুরি সেরে যাওয়ার পর নূন্যতম ৭ দিন অপেক্ষা করতে হবে।",
            "অ্যান্টিবায়োটিক গ্রহণ: অ্যান্টিবায়োটিক ওষুধের শেষ ডোজটি নেওয়ার পর অন্তত ৭ থেকে ১৪ দিন পার হতে হবে।",
            "ছোটখাটো অপারেশন: অপারেশনের ধরন ও ক্ষত সেরে ওঠার ওপর ভিত্তি করে ৩ থেকে ৬ মাস রক্তদান থেকে বিরত থাকতে হবে।",
            "দাঁতের চিকিৎসা: দাঁত তোলার মতো চিকিৎসার পর ২৪ থেকে ৭২ ঘণ্টা রক্ত দেওয়া যাবে না কারণ মুখের ব্যাকটেরিয়া রক্তে প্রবেশ করতে পারে।"
          ]
        },
        {
          type: "callout",
          text: "গুরুত্বপূর্ণ তথ্য: আপনি যদি সম্প্রতি বাংলাদেশের পার্বত্য অঞ্চলে (যেমন বান্দরবান, খাগড়াছড়ি বা রাঙ্গামাটি) ভ্রমণ করে থাকেন, তবে রক্তদানের পূর্বে তা চিকিৎসককে জানান। ম্যালেরিয়া প্রবণ এলাকায় ভ্রমণের কারণে ৩ থেকে ১২ মাসের সাময়িক বিরতি প্রযোজ্য হতে পারে।"
        }
      ],
      faqs: [
        {
          question: "উচ্চ রক্তচাপ থাকলে কি রক্ত দেওয়া যায়?",
          answer: "হ্যাঁ, যদি রক্তদানের দিন আপনার রক্তচাপ নিয়ন্ত্রণের মধ্যে থাকে (১৪০/৯০ এর নিচে) এবং আপনি সুস্থ বোধ করেন, তবে রক্তচাপের ওষুধ খাওয়া সত্ত্বেও রক্ত দেওয়া সম্ভব।"
        },
        {
          question: "ডায়াবেটিস রোগীরা কি রক্ত দিতে পারেন?",
          answer: "যারা মুখে খাওয়ার বড়ি বা ডায়েটের মাধ্যমে ডায়াবেটিস নিয়ন্ত্রণে রাখেন তারা রক্ত দিতে পারবেন। তবে যারা নিয়মিত ইনসুলিন ইনজেকশন নেন, তাদের রক্তদান না করার পরামর্শ দেওয়া হয়।"
        }
      ],
      conclusion: "বেশিরভাগ সুস্থ প্রাপ্তবয়স্ক মানুষই রক্তদানের চমৎকার সুযোগটি গ্রহণ করতে পারেন। আপনার যদি এই যোগ্যতাগুলো থাকে, তবে আজই একটি জীবন বাঁচানোর মহান সুযোগ কাজে লাগান।",
      cta: "আজই DonateLife BD-এর অনলাইন যোগ্যতা ক্যালকুলেটর ব্যবহার করুন এবং আপনার সুবিধাজনক সময়ে রক্তদানের সময় নির্ধারণ করুন।"
    }
  },
  {
    id: "who-should-not-donate-blood",
    slug: "who-should-not-donate-blood-temporary-permanent",
    category: "Donor Guidelines",
    tags: ["Safety Rules", "Donor Deferrals", "Medical Precautions"],
    featuredImageIdea: "A structured, clean vector document checklist highlighting red warning caution marks for chronic illness and safety thresholds.",
    en: {
      seoTitle: "Who Should Not Donate Blood? Temporary & Permanent Deferrals | DonateLife BD",
      metaTitle: "Contraindications & Deferrals for Blood Donors",
      metaDescription: "Understand the medical conditions that temporarily or permanently restrict you from donating blood. Learn how blood screening protects patient safety.",
      introduction: "While blood donation is a noble act, the safety of both the donor and the recipient is our absolute highest priority. Certain health conditions, chronic medical diagnoses, lifestyle habits, or medical treatments make blood donation unsafe. These are clinically classified into 'Temporary Deferrals' (you can donate after a specific time) and 'Permanent Deferrals' (you must never donate blood). Let us discuss these conditions clearly.",
      tableOfContents: [
        { label: "What is a Donor Deferral?", anchor: "deferral" },
        { label: "Permanent Deferrals: Under No Circumstances", anchor: "permanent" },
        { label: "Temporary Deferrals: Just Wait it Out", anchor: "temporary" },
        { label: "Why Truthful Declaration is Crucial", anchor: "truth" },
        { label: "Summary of Safety Standards", anchor: "summary" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "What is a Donor Deferral?",
          text: "A donor deferral occurs when a person is assessed as currently ineligible to donate blood. Deferral does not mean you are permanently unhealthy; rather, it is a precautionary system to safeguard your body or ensure that the blood transfused to a highly vulnerable patient is entirely free of pathogens and medications that could trigger allergic reactions."
        },
        {
          type: "h2",
          heading: "Permanent Deferrals: When You Must Never Donate Blood",
          text: "Under international medical guidelines, individuals with the following health conditions are permanently restricted from donating blood to protect their life and prevent transmitting fatal diseases to patients:"
        },
        {
          type: "bullet",
          items: [
            "Infectious Diseases: Testing positive for HIV/AIDS, active Hepatitis B, or Hepatitis C at any point in your life.",
            "Cardiovascular Disease: History of heart failure, severe ischemic heart disease, or chronic heart valve disease.",
            "Cancer/Malignancy: Active cancer or a medical history of blood cancers (leukemia, lymphoma).",
            "Bleeding Disorders: Genetic conditions like Hemophilia or Von Willebrand disease that impair blood clotting.",
            "Chronic Organ Failure: Chronic Kidney Disease, severe liver cirrhosis, or advanced pulmonary conditions."
          ]
        },
        {
          type: "h2",
          heading: "Temporary Deferrals: Conditions That Postpone Donation",
          text: "Temporary deferrals mean you can safely return to DonateLife BD once the recovery period or risk window has completely closed. Here are the most common temporary conditions:"
        },
        {
          type: "table",
          tableHeaders: ["Medical Condition/Event", "Deferral Period Required", "Reasoning"],
          tableRows: [
            ["Pregnancy & Breastfeeding", "6 Months post-childbirth | Defer while lactating", "Allows maternal iron levels and blood volume to stabilize."],
            ["Tattoo, Piercing, or Acupuncture", "12 Months from the date of procedure", "Risk of trace contamination from unsterile needles."],
            ["Major Surgery", "6 to 12 Months", "Ensures complete physiological recovery and healing."],
            ["Typhoid Recovery", "12 Months post-complete clinical recovery", "Bacterium can remain dormant in bone marrow."],
            ["Recent Blood Transfusion", "12 Months from transfusion date", "Ensures no delayed transfusion-transmissible pathogens are incubating."]
          ]
        },
        {
          type: "callout",
          text: "Critical Rule: If you have received a vaccine, different deferral periods apply. For the Covid-19 vaccine or standard flu shot, you must wait 7 to 14 days. For live-attenuated vaccines like BCG or MMR, you must wait 4 weeks before donating."
        },
        {
          type: "h2",
          heading: "Why Truthful Declaration is Crucial",
          text: "During the DonateLife BD registration or hospital screening, you will be asked a series of deeply personal health and lifestyle questions. It is extremely important to answer these with 100% honesty. Although all donated blood undergoes advanced screening in Bangladesh, some viruses have a 'window period'—a timeframe where the virus is present in the bloodstream but cannot yet be detected by lab tests. An honest pre-donation questionnaire is the ultimate layer of defense for fragile thalassemia children and critical patients."
        }
      ],
      faqs: [
        {
          question: "Can I donate blood if I have a tattoo?",
          answer: "Yes, you can safely donate blood if your tattoo was done more than 12 months ago in a professional, licensed studio using sterilized needles. If it was within the last 12 months, you must wait."
        },
        {
          question: "I took paracetamol yesterday. Can I donate today?",
          answer: "Yes. Paracetamol does not restrict you from donating blood. However, if you took aspirin or pain relievers containing blood thinners, you must defer platelet donation for 48 hours."
        }
      ],
      conclusion: "Understanding who should not donate is just as critical as finding new donors. Keeping our blood supply clean, sterile, and safe ensures we save lives without causing harm.",
      cta: "Check our comprehensive safe-donation questionnaire on DonateLife BD to verify your eligibility today."
    },
    bn: {
      seoTitle: "কারা রক্ত দিতে পারবেন না? সাময়িক ও স্থায়ী কারণসমূহ | DonateLife BD",
      metaTitle: "রক্তদানের নিষেধাজ্ঞা ও সাময়িক বিরতিসমূহ - মেডিকেল গাইড",
      metaDescription: "কোন কোন শারীরিক অবস্থায় রক্তদান করা নিষেধ তা জানুন। স্থায়ী ও সাময়িক রক্তদানের নিষেধাজ্ঞাগুলোর বৈজ্ঞানিক কারণ এবং রোগীর সুরক্ষার নিয়মাবলী পড়ুন।",
      introduction: "রক্তদান একটি মহৎ ও প্রশংসনীয় কাজ হলেও, রক্তদাতা এবং রক্ত গ্রহণকারী রোগীর স্বাস্থ্য ও নিরাপত্তা আমাদের কাছে সবচেয়ে গুরুত্বপূর্ণ। নির্দিষ্ট কিছু রোগ, জীবনযাত্রার ধরন বা ওষুধের ব্যবহারের কারণে রক্তদান করা ঝুঁকিপূর্ণ হতে পারে। চিকিৎসাবিজ্ঞানে এগুলোকে 'সাময়িক বিরতি' এবং 'স্থায়ী নিষেধাজ্ঞা'—এই দুই ভাগে ভাগ করা হয়েছে। চলুন বিস্তারিত জেনে নেই।",
      tableOfContents: [
        { label: "রক্তদানে বিরতি বা ডেফারেল বলতে কী বোঝায়?", anchor: "deferral" },
        { label: "স্থায়ী নিষেধাজ্ঞা: যারা কখনোই রক্ত দিতে পারবেন না", anchor: "permanent" },
        { label: "সাময়িক নিষেধাজ্ঞা: নির্দিষ্ট সময় পর রক্তদান সম্ভব", anchor: "temporary" },
        { label: "সঠিক ও সত্য তথ্য দেওয়া কেন অত্যন্ত জরুরী", anchor: "truth" },
        { label: "নিরাপত্তা মানের সংক্ষিপ্ত রূপ", anchor: "summary" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "রক্তদানে বিরতি বা ডেফারেল বলতে কী বোঝায়?",
          text: "যখন কোনো ব্যক্তিকে রক্তদানের জন্য সাময়িক বা স্থায়ীভাবে অনুপযুক্ত ঘোষণা করা হয়, চিকিৎসাবিজ্ঞানের ভাষায় তাকে 'ডেফারেল' বা রক্তদানে বিরতি বলা হয়। এর মানে এই নয় যে আপনি চিরতরে অসুস্থ; বরং এটি আপনার শরীরকে অতিরিক্ত ধকল থেকে বাঁচাতে এবং গ্রহীতাকে যেকোনো সংক্রামক জীবাণু বা ওষুধের পার্শ্বপ্রতিক্রিয়া থেকে মুক্ত রাখতে ব্যবহৃত একটি অত্যন্ত নিরাপদ ও আন্তর্জাতিকভাবে স্বীকৃত স্ক্রিনিং পদ্ধতি।"
        },
        {
          type: "h2",
          heading: "স্থায়ী নিষেধাজ্ঞা: যারা কখনোই রক্ত দিতে পারবেন না",
          text: "আন্তর্জাতিক চিকিৎসা নির্দেশিকা অনুযায়ী, নিম্নোক্ত শারীরিক অবস্থার রোগীদের নিজের জীবনের সুরক্ষা এবং গ্রহীতা রোগীর নিরাপত্তার স্বার্থে স্থায়ীভাবে রক্তদান থেকে বিরত থাকতে হবে:"
        },
        {
          type: "bullet",
          items: [
            "সংক্রামক ব্যাধি: জীবনে যেকোনো সময় এইচআইভি/এইডস, হেপাটাইটিস বি বা হেপাটাইটিস সি পজিটিভ হলে।",
            "হৃদরোগ: হার্ট ফেইলিউর, মারাত্মক ইসকেমিক হার্ট ডিজিজ বা হার্টের ভাল্বের কোনো রোগ থাকলে।",
            "রক্তের ক্যান্সার: লিউকেমিয়া, লিম্ফোমাসহ যেকোনো ধরনের রক্তের ক্যান্সারের ইতিহাস থাকলে।",
            "রক্তক্ষরণজনিত সমস্যা: হিমোফিলিয়া বা ভন উইলেব্র্যান্ড রোগের মতো রক্ত জমাট বাঁধতে না পারার জেনেটিক সমস্যা থাকলে।",
            "অঙ্গ নিষ্ক্রিয়তা: ক্রনিক কিডনি ডিজিজ বা লিভার সিরোসিসের মতো জটিল সমস্যা থাকলে।"
          ]
        },
        {
          type: "h2",
          heading: "সাময়িক নিষেধাজ্ঞা: নির্দিষ্ট সময় পর রক্তদান সম্ভব",
          text: "সাময়িক নিষেধাজ্ঞার মানে হলো আপনার শরীর সুস্থ হওয়ার পর অথবা ঝুঁকির মেয়াদ শেষ হওয়ার পর আপনি আবার DonateLife BD-তে রক্ত দিতে পারবেন:"
        },
        {
          type: "table",
          tableHeaders: ["শারীরিক অবস্থা বা ঘটনা", "রক্তদান থেকে বিরত থাকার সময়", "কেন এই বিরতি"],
          tableRows: [
            ["গর্ভাবস্থা ও স্তন্যদানকাল", "সন্তান প্রসবের পর ৬ মাস | বুকের দুধ খাওয়ানো কালীন", "মায়ের শরীরে আয়রনের ঘাটতি পূরণ এবং রক্ত সঞ্চালন স্বাভাবিক করার জন্য।"],
            ["ট্যাটু, পিয়ার্সিং বা আকুপাংচার", "ট্যাটু করার দিন থেকে ১২ মাস", "অজীবাণুমুক্ত সুঁইয়ের মাধ্যমে ছোঁয়াচে রক্তের জীবাণু ছড়ানোর ঝুঁকি এড়াতে।"],
            ["বড় ধরনের অপারেশন", "৬ থেকে ১২ মাস", "অপারেশনের পর শরীরের সম্পূর্ণ ধকল কাটিয়ে ওঠার জন্য।"],
            ["টাইফয়েড থেকে আরোগ্য লাভ", "পুরোপুরি সুস্থ হওয়ার পর ১২ মাস", "টাইফয়েডের ব্যাকটেরিয়া অনেক সময় অস্থিমজ্জায় সুপ্ত অবস্থায় থাকতে পারে।"],
            ["নিজে রক্ত গ্রহণ করলে", "রক্ত গ্রহণের তারিখ থেকে ১২ মাস", "অন্যের রক্তে থাকা কোনো সুপ্ত জীবাণু যাতে আপনার শরীরে বিস্তার না করতে পারে।"
            ]
          ]
        },
        {
          type: "callout",
          text: "টিকা সংক্রান্ত নিয়ম: আপনি যদি করোনা ভাইরাসের টিকা বা সাধারণ ইনফ্লুয়েঞ্জার টিকা নিয়ে থাকেন, তবে ৭ থেকে ১৪ দিন অপেক্ষা করতে হবে। আর যক্ষ্মা (BCG) বা হামের (MMR) মতো জীবন্ত ব্যাকটেরিয়াযুক্ত টিকা নিলে নূন্যতম ৪ সপ্তাহ পর রক্ত দেওয়া যাবে।"
        },
        {
          type: "h2",
          heading: "সঠিক ও সত্য তথ্য দেওয়া কেন অত্যন্ত জরুরী",
          text: "DonateLife BD-তে নিবন্ধনের সময় আপনাকে আপনার স্বাস্থ্য ও জীবনযাত্রা সম্পর্কিত বেশ কিছু ব্যক্তিগত প্রশ্ন করা হবে। এই প্রশ্নগুলোর শতভাগ সত্য উত্তর দেওয়া অত্যন্ত জরুরী। যদিও আমরা রক্ত নেওয়ার পর ল্যাবে অত্যন্ত সতর্কতার সাথে রক্ত পরীক্ষা করি, তবুও ভাইরাসের একটি 'উইন্ডো পিরিয়ড' থাকে—যার মানে হলো জীবাণু রক্তে প্রবেশ করলেও প্রাথমিক অবস্থায় তা ল্যাব পরীক্ষায় ধরা পড়ে না। তাই থ্যালাসেমিয়া আক্রান্ত নিষ্পাপ শিশুদের জীবন বাঁচাতে আপনার সত্য উত্তরই সবচেয়ে বড় ঢাল।"
        }
      ],
      faqs: [
        {
          question: "শরীরে ট্যাটু থাকলে কি রক্ত দেওয়া যাবে?",
          answer: "হ্যাঁ, যদি আপনার ট্যাটুটি উন্নত ও লাইসেন্সপ্রাপ্ত স্টুডিওতে জীবাণুমুক্ত সুঁইয়ের মাধ্যমে অন্তত ১২ মাস আগে করা হয়ে থাকে, তবে আপনি রক্ত দিতে পারবেন। গত ১২ মাসের মধ্যে ট্যাটু করে থাকলে অপেক্ষা করতে হবে।"
        },
        {
          question: "আমি গতকাল প্যারাসিটামল খেয়েছি, আজ কি রক্ত দিতে পারব?",
          answer: "হ্যাঁ। প্যারাসিটামল খেলে রক্তদানে কোনো বাধা নেই। তবে অ্যাসপিরিন বা অন্য কোনো রক্ত পাতলা করার ওষুধ খেয়ে থাকলে প্লেটলেট দেওয়ার আগে অন্তত ৪৮ ঘণ্টা অপেক্ষা করতে হবে।"
        }
      ],
      conclusion: "কারা রক্ত দিতে পারবেন না তা জানা একজন সচেতন নাগরিকের দায়িত্ব। আমাদের রক্তের সরবরাহকে বিশুদ্ধ ও নিরাপদ রাখার মাধ্যমে আমরা রোগী ও নিজের স্বাস্থ্য—উভয়ই সুরক্ষিত রাখতে পারি।",
      cta: "DonateLife BD-এর অনলাইন চেকলিস্টটি ব্যবহার করে আজই আপনার রক্তদানের উপযুক্ততা নিশ্চিত করুন।"
    }
  },
  {
    id: "blood-donation-process",
    slug: "step-by-step-blood-donation-process",
    category: "Donor Guidelines",
    tags: ["Process Guide", "First Time Donor", "Safe Donation"],
    featuredImageIdea: "A visual continuous progress line showcasing registration desk, medical vitals check, active donation lounge, and recovery juice bar.",
    en: {
      seoTitle: "The Step-by-Step Blood Donation Process Explained | DonateLife BD",
      metaTitle: "Step-by-Step Blood Donation Process - What to Expect",
      metaDescription: "First time donating blood? Demystify the entire process from arrival to recovery. Learn how our certified medical team ensures your safety and comfort.",
      introduction: "If you are preparing to donate blood for the first time, it is entirely natural to feel a bit anxious. Understanding exactly what happens at every stage of the process can dispel fears and make your experience smooth and deeply satisfying. At DonateLife BD, we adhere to absolute clinical hygiene guidelines. Here is a comprehensive walkthrough of what you will experience during your 30-minute lifesaving journey.",
      tableOfContents: [
        { label: "Step 1: Registration & Identification", anchor: "registration" },
        { label: "Step 2: Private Medical Screening", anchor: "screening" },
        { label: "Step 3: The Active Donation Process", anchor: "donation" },
        { label: "Step 4: Post-Donation Recovery & Refreshment", anchor: "recovery" },
        { label: "Key Milestones Summary", anchor: "milestones" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "Step 1: Registration & Identification",
          text: "When you arrive at the donation center or donor lounge, you will present a valid national identity card (NID), student card, or driving license to verify your age. If you are registered on DonateLife BD, you can simply display your custom digital donor ID code. You will fill out a confidential medical questionnaire detailing your recent health status, medication intake, lifestyle, and travel history."
        },
        {
          type: "h2",
          heading: "Step 2: Private Medical Screening",
          text: "Next, you will undergo a private consultation with a medical professional. This step is designed to keep you completely safe. The medical officer will:"
        },
        {
          type: "bullet",
          items: [
            "Measure your blood pressure (BP) and resting heart rate.",
            "Take a tiny drop of blood from your fingertip using a sterile, single-use lancet to measure your hemoglobin level.",
            "Confirm that you weigh at least 45 to 50 kg and are free of active fever.",
            "Review your questionnaire answers in private to ensure complete eligibility."
          ]
        },
        {
          type: "h2",
          heading: "Step 3: The Active Donation Process",
          text: "Once approved, you will be guided to a highly comfortable, reclining donor chair. A certified phlebotomist will cleanse the inner bend of your elbow with an antiseptic solution (chlorhexidine or alcohol swab) to prevent bacterial entry. They will insert a sterile, single-use needle attached to a specialized collection bag. Here are some key facts about this stage:"
        },
        {
          type: "bullet",
          items: [
            "The entire blood flow takes only 8 to 10 minutes to complete.",
            "The volume collected is approximately 350 to 450 ml, which represents only about 8-10% of your body's total blood supply.",
            "All equipment is strictly single-use and opened right in front of you. There is absolutely zero risk of contracting HIV or any infection from donating blood."
          ]
        },
        {
          type: "callout",
          text: "Comfort Tip: Take slow, deep breaths, or listen to soft music. You can also chat with our friendly medical staff to stay relaxed."
        },
        {
          type: "h2",
          heading: "Step 4: Post-Donation Recovery & Refreshment",
          text: "After the donation, the needle is carefully removed, and a small sterile bandage is applied. You will be asked to lie flat on the donor bed for 10 to 15 minutes to allow your blood pressure to adapt to the volume change. Afterward, you will move to our refreshment lounge, where you will receive:"
        },
        {
          type: "bullet",
          items: [
            "Fresh juice, coconut water, or water to rapidly replenish your fluid volume.",
            "Light snacks, biscuits, or a banana to stabilize blood glucose levels.",
            "A voluntary donor certificate and a big thank-you smile from DonateLife BD."
          ]
        },
        {
          type: "table",
          tableHeaders: ["Stage", "Time Required", "Primary Focus"],
          tableRows: [
            ["1. Registration", "5-10 Minutes", "Verification of identity and basic health form."],
            ["2. Screening", "5 Minutes", "Measuring BP, pulse, weight, and hemoglobin levels."],
            ["3. Active Donation", "8-10 Minutes", "Clinical drawing of 350-450 ml of whole blood."],
            ["4. Resting & Snack", "15 Minutes", "Hydration, recovery, and prevention of dizziness."]
          ]
        }
      ],
      faqs: [
        {
          question: "Can I get an infection or HIV from donating blood?",
          answer: "Absolutely not. Every single needle, syringe, tube, and collection bag used in blood donation is 100% sterile, brand new, and discarded immediately after use. It is physically impossible to catch any disease by donating blood."
        },
        {
          question: "What should I do if I feel dizzy after donating?",
          answer: "Dizziness is usually caused by a mild drop in blood pressure. If you feel lightheaded, simply lie down with your legs slightly elevated, drink plenty of water, and rest for another 10 minutes."
        }
      ],
      conclusion: "As you can see, the actual process of donating blood is extremely simple, painless, and completely safe. In under 30 minutes, you can accomplish something extraordinary—giving another human being their tomorrow.",
      cta: "Be a hero in your local community. Schedule your next blood donation on DonateLife BD now."
    },
    bn: {
      seoTitle: "রক্তদান প্রক্রিয়ার সহজ ধাপসমূহ: সম্পূর্ণ নির্দেশিকা | DonateLife BD",
      metaTitle: "রক্তদান করার পদ্ধতি - ধাপে ধাপে বিস্তারিত গাইড",
      metaDescription: "প্রথমবার রক্ত দিতে যাচ্ছেন? রক্তদানের শুরু থেকে শেষ পর্যন্ত সম্পূর্ণ প্রক্রিয়াটি জানুন। কীভাবে আমাদের চিকিৎসাকর্মীরা আপনার নিরাপত্তা নিশ্চিত করেন তা পড়ুন।",
      introduction: "আপনি যদি প্রথমবার রক্ত দেওয়ার প্রস্তুতি নিয়ে থাকেন, তবে সামান্য ভয় লাগা খুবই স্বাভাবিক। কিন্তু পুরো প্রক্রিয়াটি আগে থেকে জানা থাকলে আপনার ভয় কেটে যাবে এবং আপনি একটি চমৎকার ও তৃপ্তিদায়ক অনুভূতি লাভ করবেন। DonateLife BD-তে আমরা সর্বোচ্চ আন্তর্জাতিক চিকিৎসাগত স্বাস্থ্যবিধি মেনে চলি। চলুন জেনে নিই আপনার এই ৩০ মিনিটের জীবন রক্ষাকারী যাত্রার ধাপগুলো কী কী।",
      tableOfContents: [
        { label: "ধাপ ১: নিবন্ধন ও পরিচয় যাচাইকরণ", anchor: "registration" },
        { label: "ধাপ ২: ব্যক্তিগত সংক্ষিপ্ত স্বাস্থ্য পরীক্ষা", anchor: "screening" },
        { label: "ধাপ ৩: রক্ত গ্রহণের মূল পর্ব", anchor: "donation" },
        { label: "ধাপ ৪: রক্তদান পরবর্তী বিশ্রাম ও খাবার", anchor: "recovery" },
        { label: "ধাপগুলোর সময়সীমার সংক্ষিপ্ত তালিকা", anchor: "milestones" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "ধাপ ১: নিবন্ধন ও পরিচয় যাচাইকরণ",
          text: "রক্তদান কেন্দ্রে পৌঁছানোর পর, আপনাকে আপনার পরিচয় নিশ্চিত করার জন্য একটি বৈধ পরিচয়পত্র (যেমন জাতীয় পরিচয়পত্র বা NID, ড্রাইভিং লাইসেন্স বা স্টুডেন্ট আইডি কার্ড) দেখাতে হবে। আপনি যদি DonateLife BD অ্যাপ বা ওয়েবসাইটে নিবন্ধিত থাকেন, তবে আপনার ডিজিটাল আইডি কোড দেখালেই চলবে। এরপর আপনাকে একটি সংক্ষিপ্ত প্রশ্নপত্র দেওয়া হবে যেখানে আপনার বর্তমান শারীরিক সুস্থতা, গৃহীত ওষুধ এবং শেষ ভ্রমণের তথ্য লিখতে হবে।"
        },
        {
          type: "h2",
          heading: "ধাপ ২: ব্যক্তিগত সংক্ষিপ্ত স্বাস্থ্য পরীক্ষা",
          text: "নিবন্ধন শেষ হলে একজন চিকিৎসক সম্পূর্ণ গোপনে আপনার একটি স্বাস্থ্য পরীক্ষা করবেন। এই ধাপটি আপনার শরীরের সুরক্ষার জন্য করা হয়। এখানে চিকিৎসক যা পরীক্ষা করবেন:"
        },
        {
          type: "bullet",
          items: [
            "আপনার রক্তচাপ (BP) এবং হার্টবিট পরিমাপ করবেন।",
            "সম্পূর্ণ জীবাণুমুক্ত ল্যানসেট দিয়ে আপনার আঙুলের ডগা থেকে মাত্র এক ফোঁটা রক্ত নিয়ে হিমোগ্লোবিনের মাত্রা পরীক্ষা করবেন।",
            "আপনার ওজন কমপক্ষে ৪৫ থেকে ৫০ কেজি এবং শরীরে জ্বর নেই তা নিশ্চিত করবেন।"
          ]
        },
        {
          type: "h2",
          heading: "ধাপ ৩: রক্ত গ্রহণের মূল পর্ব",
          text: "স্বাস্থ্য পরীক্ষায় উত্তীর্ণ হওয়ার পর আপনাকে আরামদায়ক রক্তদান শয্যায় নিয়ে যাওয়া হবে। একজন অভিজ্ঞ রক্তসংগ্রাহক (Phlebotomist) আপনার কনুইয়ের ভেতরের অংশ অ্যালকোহল প্যাড দিয়ে জীবাণুমুক্ত করবেন। এরপর একটি নতুন ও জীবাণুমুক্ত সুঁইয়ের মাধ্যমে রক্ত নেওয়া শুরু হবে। এই পর্বের কিছু গুরুত্বপূর্ণ তথ্য:"
        },
        {
          type: "bullet",
          items: [
            "রক্ত সংগ্রহের মূল প্রক্রিয়াটি সম্পন্ন হতে মাত্র ৮ থেকে ১০ মিনিট সময় লাগে।",
            "আপনার শরীর থেকে আনুমানিক ৩৫০ থেকে ৪৫০ মিলি রক্ত নেওয়া হয়, যা আপনার শরীরের মোট রক্তের মাত্র ৮-১০ শতাংশ।",
            "রক্ত নেওয়ার সমস্ত সুঁই ও ব্যাগ সম্পূর্ণ নতুন এবং আপনার সামনেই প্যাকেট থেকে খোলা হয়। তাই রক্ত দিলে সংক্রামক রোগ হওয়ার কোনো সুযোগ নেই।"
          ]
        },
        {
          type: "callout",
          text: "আরামদায়ক পরামর্শ: রক্ত দেওয়ার সময় বড় বড় শ্বাস নিন এবং শান্ত থাকুন। নার্সদের সাথে কথা বলে নিজেকে ব্যস্ত রাখতে পারেন।"
        },
        {
          type: "h2",
          heading: "ধাপ ৪: রক্তদান পরবর্তী বিশ্রাম ও খাবার",
          text: "রক্ত নেওয়া শেষ হওয়ার পর সুঁইটি সাবধানে বের করে সেখানে একটি ব্যান্ডেজ লাগিয়ে দেওয়া হবে। রক্তচাপ স্বাভাবিক হতে সাহায্য করার জন্য আপনাকে ওই শয্যায় ১০ থেকে ১৫ মিনিট শুয়ে থাকতে বলা হবে। এরপর আপনাকে বিশ্রাম কক্ষে নিয়ে যাওয়া হবে যেখানে আপনি পাবেন:"
        },
        {
          type: "bullet",
          items: [
            "শরীরের তরল অংশ দ্রুত পূরণের জন্য তাজা জুস, ডাবের পানি বা খাওয়ার পানি।",
            "রক্তের শর্করা বা গ্লুকোজের মাত্রা স্বাভাবিক রাখতে বিস্কুট, কলা বা হালকা নাস্তা।",
            "DonateLife BD-এর পক্ষ থেকে একটি ডিজিটাল বা কাগজের রক্তদাতা সম্মাননা সার্টিফিকেট।"
          ]
        },
        {
          type: "table",
          tableHeaders: ["ধাপসমূহ", "প্রয়োজনীয় সময়", "প্রধান কাজ"],
          tableRows: [
            ["১. নিবন্ধন", "৫-১০ মিনিট", "পরিচয় ও প্রাথমিক ফর্ম পূরণ।"],
            ["২. স্ক্রিনিং", "৫ মিনিট", "রক্তচাপ, পালস ও হিমোগ্লোবিন পরীক্ষা।"],
            ["৩. রক্তদান", "৮-১০ মিনিট", "৩৫০-৪৫০ মিলি রক্ত সংগ্রহ।"],
            ["৪. বিশ্রাম ও নাস্তা", "১৫ মিনিট", "ডাবের পানি/জুস পান ও স্বাভাবিক হওয়া।"]
          ]
        }
      ],
      faqs: [
        {
          question: "রক্ত দিলে কি এইডস বা কোনো রোগ হতে পারে?",
          answer: "একেবারেই অসম্ভব। রক্তদানে ব্যবহৃত প্রতিটি সুঁই, সিরিঞ্জ ও ব্যাগ সম্পূর্ণ নতুন ও ওয়ান-টাইম। একবার ব্যবহারের পরই তা ধ্বংস করে ফেলা হয়। তাই রক্তদানের কারণে রক্তদাতার শরীরে কোনো রোগ ছড়ানোর সুযোগ নেই।"
        },
        {
          question: "রক্ত দেওয়ার পর মাথা ঘুরলে কী করব?",
          answer: "মাথা ঘোরা খুবই স্বাভাবিক একটি পার্শ্বপ্রতিক্রিয়া যা সাময়িক রক্তচাপ হ্রাসের কারণে ঘটে। মাথা ঘুরলে সাথে সাথে শুয়ে পড়ুন এবং পা দুটি সামান্য উঁচুতে রাখুন। প্রচুর পানি ও জুস পান করুন।"
        }
      ],
      conclusion: "আপনার সামান্য ১৫ মিনিটের সময় এবং এক ব্যাগ রক্ত একটি মৃত্যুপথযাত্রী মানুষের মুখে হাসি ফোটাতে পারে। রক্তদান অত্যন্ত সহজ, নিরাপদ এবং পরম আত্মতৃপ্তিদায়ক একটি অভিজ্ঞতা।",
      cta: "আজই DonateLife BD-তে আপনার রক্তদানের সময় নির্ধারণ করুন এবং দেশের মানুষের পাশে দাঁড়ান।"
    }
  },
  {
    id: "before-after-blood-donation",
    slug: "what-to-do-before-during-after-blood-donation",
    category: "Donor Guidelines",
    tags: ["Donor Preparation", "Post Donation Care", "Health Guide"],
    featuredImageIdea: "A visual split screen showing a healthy balanced pre-donation meal with water on the left, and a resting donor with a post-donation snack on the right.",
    en: {
      seoTitle: "What to Do Before & After Donating Blood: Complete Care Guide | DonateLife BD",
      metaTitle: "Pre & Post Blood Donation Guidelines - Stay Safe & Energetic",
      metaDescription: "Prepare your body for a successful blood donation and recover quickly. Read expert medical advice on meals, hydration, and activities to follow.",
      introduction: "While blood donation is an exceptionally safe procedure, how you prepare your body in the 24 hours leading up to your donation and how you care for yourself afterward determines how energetic you will feel. Proper nutrition, hydration, and rest prevent common mild symptoms like dizziness or bruising. Follow this expert-backed care guide to ensure a fantastic donation experience.",
      tableOfContents: [
        { label: "Phase 1: Preparing Your Body (24 Hours Before)", anchor: "before" },
        { label: "Phase 2: What to Do on the Day of Donation", anchor: "day-of" },
        { label: "Phase 3: Crucial Steps Immediately After Donating", anchor: "after" },
        { label: "Phase 4: Recovery Tips for the Next 48 Hours", anchor: "recovery" },
        { label: "Summary Checklist", anchor: "checklist" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "Phase 1: Preparing Your Body (24 Hours Before)",
          text: "A successful blood donation starts the night before. Your blood volume and hemoglobin levels are highly sensitive to your diet and sleep patterns. Follow these pre-donation rules:"
        },
        {
          type: "bullet",
          items: [
            "Hydration Boost: Drink an extra 3 to 4 glasses of water or fresh fruit juice starting 24 hours prior. Well-hydrated blood vessels are fuller and easier for phlebotomists to locate.",
            "Iron-Rich Dinner: Eat a healthy, iron-rich meal. Include leafy green vegetables (like spinach/shak), lentils, or meat. This helps maintain high hemoglobin levels.",
            "Get Quality Sleep: Ensure you get at least 7 to 8 hours of uninterrupted restful sleep the night before. Donating while exhausted increases the likelihood of lightheadedness."
          ]
        },
        {
          type: "h2",
          heading: "Phase 2: What to Do on the Day of Donation",
          text: "When the day arrives, make these final lifestyle choices to ensure comfort:"
        },
        {
          type: "bullet",
          items: [
            "Never Fast: Eat a solid, healthy breakfast or light lunch 2 to 3 hours before arriving. Do not donate blood on an empty stomach.",
            "Avoid Fatty Foods: Steer clear of high-fat meals like biryani, parathas, or oily snacks before donating. Excess fats in the bloodstream can interfere with the post-donation clinical screening tests.",
            "Dress Comfortably: Wear clothing with loose sleeves that can easily be rolled up above your elbow."
          ]
        },
        {
          type: "h2",
          heading: "Phase 3: Crucial Steps Immediately After Donating",
          text: "After the needle is removed, the post-care phase begins. Follow these immediate recovery guidelines:"
        },
        {
          type: "bullet",
          items: [
            "Linger on the Bed: Lie completely flat for 10 minutes. Do not try to sit up or stand rapidly to avoid a sudden blood pressure drop.",
            "Pressure Bandage: Keep the pressure bandage on your arm for at least 4 to 6 hours. This prevents minor bleeding under the skin, which causes dark bruises.",
            "Drink Up: Drink the provided juice, coconut water, or water immediately to replace lost fluids."
          ]
        },
        {
          type: "h2",
          heading: "Phase 4: Recovery Tips for the Next 48 Hours",
          text: "Your body is highly efficient at regenerating lost blood volume. Support it by practicing these habits over the next two days:"
        },
        {
          type: "table",
          tableHeaders: ["Activity Category", "What to AVOID", "What to PREFER"],
          tableRows: [
            ["Physical Exercise", "Heavy weight lifting, running, or swimming.", "Light walking, desk work, and plenty of rest."],
            ["Hydration", "Alcoholic drinks and excess black coffee.", "Water, saline, fruit juices, and milk."],
            ["Smoking & Vaping", "Smoking within 2 hours after donation.", "Waiting at least 4-6 hours to avoid lightheadedness."],
            ["Dietary Needs", "Junk food and carbonated sodas.", "Iron-rich foods, Vitamin-C rich fruits (guava, lemon)."]
          ]
        },
        {
          type: "callout",
          text: "Did You Know? Vitamin C is crucial for iron absorption. Consuming fresh guavas, lemons, or oranges after donating helps your body absorb iron much faster and accelerate cell synthesis!"
        }
      ],
      faqs: [
        {
          question: "Why should I avoid fatty meals like biryani before donating?",
          answer: "Oily foods cause a temporary condition called lipemia, where fats circulate in your blood plasma. Lipemic plasma can clog laboratory screening machines and make the blood unusable for patients."
        },
        {
          question: "How do I prevent my arm from turning black or blue?",
          answer: "A dark blue mark (hematoma) occurs if blood leaks into the tissue under the skin. You can prevent this by keeping the bandage firm, avoiding heavy lifting with that arm for 24 hours, and applying cold ice packs if bruising starts."
        }
      ],
      conclusion: "Preparing your body correctly makes blood donation an enjoyable and smooth process. By taking simple steps before and after, you protect your own well-being while giving the ultimate gift to others.",
      cta: "Schedule your next blood donation on DonateLife BD and access our personalized health and recovery tips."
    },
    bn: {
      seoTitle: "রক্তদানের আগে ও পরে করণীয়: সম্পূর্ণ যত্ন গাইড | DonateLife BD",
      metaTitle: "রক্তদানের আগের ও পরের নিয়মাবলী - সুস্থ ও সতেজ থাকুন",
      metaDescription: "রক্তদানের জন্য কীভাবে শরীর প্রস্তুত করবেন এবং দ্রুত পুনরুদ্ধার করবেন? চিকিৎসকদের নির্দেশিত খাবার, পানি পান ও বিশ্রামের সঠিক নিয়মগুলো জানুন।",
      introduction: "যদিও রক্তদান একটি অত্যন্ত নিরাপদ প্রক্রিয়া, রক্তদানের ২৪ ঘণ্টা আগে আপনার শরীরের প্রস্তুতি এবং রক্তদানের পরে নিজের যত্ন নেওয়ার ওপর নির্ভর করে আপনি কতটা সতেজ বোধ করবেন। সঠিক পুষ্টি, পানি পান এবং বিশ্রাম মাথা ঘোরা বা শরীরে কালশিটে পড়ার মতো সাধারণ পার্শ্বপ্রতিক্রিয়াগুলো প্রতিরোধ করে। চমৎকার অভিজ্ঞতার জন্য এই গাইডটি অনুসরণ করুন।",
      tableOfContents: [
        { label: "ধাপ ১: রক্তদানের পূর্ববর্তী ২৪ ঘণ্টার প্রস্তুতি", anchor: "before" },
        { label: "ধাপ ২: রক্তদানের দিন করণীয়", anchor: "day-of" },
        { label: "ধাপ ৩: রক্তদানের ঠিক পরপরই যত্ন", anchor: "after" },
        { label: "ধাপ ৪: পরবর্তী ৪৮ ঘণ্টার পুনরুদ্ধার গাইড", anchor: "recovery" },
        { label: "সংক্ষিপ্ত চেকলিস্ট", anchor: "checklist" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "ধাপ ১: রক্তদানের পূর্ববর্তী ২৪ ঘণ্টার প্রস্তুতি",
          text: "একটি সফল রক্তদানের প্রস্তুতি শুরু হয় আগের রাতেই। আপনার রক্ত এবং হিমোগ্লোবিনের মাত্রা আপনার খাদ্য ও ঘুমের অভ্যাসের ওপর নির্ভর করে। এই নিয়মগুলো মেনে চলুন:"
        },
        {
          type: "bullet",
          items: [
            "প্রচুর পানি পান করুন: রক্তদানের ২৪ ঘণ্টা আগে থেকে সাধারণ সময়ের চেয়ে ৩-৪ গ্লাস বেশি পানি বা ফলের রস পান করুন। রক্তে পানির পরিমাণ ঠিক থাকলে শিরা খুঁজে পাওয়া সহজ হয়।",
            "আয়রন সমৃদ্ধ খাবার: আগের রাতে আয়রন সমৃদ্ধ খাবার যেমন সবুজ শাকসবজি (পালং শাক), ডাল, ডিম বা মাংস খান। এটি রক্তের হিমোগ্লোবিন ঠিক রাখতে সাহায্য করে।",
            "পর্যাপ্ত ঘুমান: আগের রাতে অন্তত ৭ থেকে ৮ ঘণ্টা নিবিড় ও আরামদায়ক ঘুম নিশ্চিত করুন। ক্লান্ত শরীরে রক্ত দিলে মাথা ঘোরার সম্ভাবনা বেড়ে যায়।"
          ]
        },
        {
          type: "h2",
          heading: "ধাপ ২: রক্তদানের দিন করণীয়",
          text: "রক্তদানের দিন আপনার কিছু ছোটখাটো সিদ্ধান্ত পুরো প্রক্রিয়াটিকে আরামদায়ক করতে পারে:"
        },
        {
          type: "bullet",
          items: [
            "কখনো খালি পেটে থাকবেন না: রক্ত দিতে যাওয়ার ২-৩ ঘণ্টা আগে একটি স্বাস্থ্যকর সকালের নাস্তা বা হালকা দুপুরের খাবার খেয়ে নিন। খালি পেটে রক্ত দেওয়া নিষিদ্ধ।",
            "তৈলাক্ত খাবার এড়িয়ে চলুন: রক্তদানের আগে অতিরিক্ত চর্বি বা তৈলাক্ত খাবার যেমন বিরিয়ানি, পরোটা বা সিঙ্গাড়া খাওয়া থেকে বিরত থাকুন। রক্তে অতিরিক্ত চর্বি থাকলে তা ল্যাব টেস্টে বিঘ্ন ঘটায়।",
            "সহজ পোশাক পরুন: এমন ঢিলেঢালা পোশাক পরুন যার হাতা কনুইয়ের ওপর সহজে গোটানো যায়।"
          ]
        },
        {
          type: "h2",
          heading: "ধাপ ৩: রক্তদানের ঠিক পরপরই যত্ন",
          text: "সুঁই বের করে নেওয়ার পর আপনার নিজের যত্নের পর্বটি শুরু হয়। এগুলো মেনে চলুন:"
        },
        {
          type: "bullet",
          items: [
            "শয্যায় শুয়ে থাকুন: রক্ত দেওয়ার পর অন্তত ১০ মিনিট সোজা শুয়ে থাকুন। মাথা ঘোরানো এড়াতে হঠাৎ করে উঠে বসা বা দাঁড়িয়ে যাওয়া থেকে বিরত থাকুন।",
            "ব্যান্ডেজ চেপে রাখুন: সুঁইয়ের স্থানে লাগানো ব্যান্ডেজটি অন্তত ৪ থেকে ৬ ঘণ্টা রাখুন। এটি চামড়ার নিচে রক্ত জমা হয়ে কালশিটে পড়া বন্ধ করে।",
            "জুস বা পানি পান করুন: রক্ত দেওয়ার পর কেন্দ্রে সরবরাহকৃত জুস, ডাবের পানি বা স্যালাইন সাথে সাথে পান করুন।"
          ]
        },
        {
          type: "h2",
          heading: "ধাপ ৪: পরবর্তী ৪৮ ঘণ্টার পুনরুদ্ধার গাইড",
          text: "আপনার শরীর রক্তকণিকাগুলো পুনরুৎপাদনে অত্যন্ত দক্ষ। শরীরকে সাহায্য করতে আগামী দুই দিন এই অভ্যাসগুলো মেনে চলুন:"
        },
        {
          type: "table",
          tableHeaders: ["কার্যক্রমের ধরন", "যা বর্জন করবেন", "যা গ্রহণ করবেন"],
          tableRows: [
            ["শারীরিক ব্যায়াম", "ভারী ওজন তোলা, দৌড়ানো বা সাঁতার কাটা।", "হালকা হাঁটাচলা, দাপ্তরিক কাজ ও পর্যাপ্ত বিশ্রাম।"],
            ["তরল গ্রহণ", "অতিরিক্ত চা, কফি বা ক্যাফেইন জাতীয় পানীয়।", "পর্যাপ্ত সাধারণ পানি, খাবার স্যালাইন, ফলের রস ও দুধ।"],
            ["ধূমপান", "রক্তদানের পরপরই ধূমপান করা।", "রক্তদানের পর অন্তত ৪-৬ ঘণ্টা পর ধূমপান করুন যাতে মাথা না ঘোরে।"],
            ["খাদ্যাভ্যাস", "বাইরের খোলা বা অতিরিক্ত ভাজাপোড়া খাবার।", "আয়রন ও ভিটামিন-সি যুক্ত টক জাতীয় ফল (পেয়ারা, লেবু)।"]
          ]
        },
        {
          type: "callout",
          text: "জানতেন কি? ভিটামিন-সি শরীরকে খাদ্য থেকে আয়রন শোষণ করতে সাহায্য করে। তাই রক্তদানের পর পেয়ারা, কমলা বা লেবুর শরবত পান করলে আপনার নতুন রক্তকণিকা অনেক দ্রুত তৈরি হয়!"
        }
      ],
      faqs: [
        {
          question: "রক্তদানের আগে বিরিয়ানি খাওয়া যাবে না কেন?",
          answer: "তৈলাক্ত খাবার রক্তে সাময়িকভাবে চর্বির পরিমাণ বাড়িয়ে দেয়। এর ফলে ল্যাবরেটরিতে রক্তের সঠিক স্ক্রিনিং ও পরীক্ষা করা কঠিন হয়ে পড়ে এবং অনেক সময় সংগৃহীত রক্ত ব্যবহার অনুপযোগী হয়ে যায়।"
        },
        {
          question: "রক্ত দেওয়ার স্থানে নীল বা কালো দাগ হয়ে গেলে কী করব?",
          answer: "সুঁই ফোটানোর স্থানে সামান্য রক্ত চামড়ার নিচে ছড়িয়ে পড়লে এমন নীলচে কালশিটে দাগ বা হেমাটোমা হয়। এটি প্রতিরোধ করতে ব্যান্ডেজটি শক্ত করে চেপে রাখুন এবং দাগ হওয়া স্থানে বরফ বা ঠান্ডা সেঁক দিন।"
        }
      ],
      conclusion: "সঠিক প্রস্তুতি রক্তদানকে একটি আনন্দদায়ক এবং সতেজ অভিজ্ঞতায় রূপান্তর করে। সহজ কিছু নিয়ম মেনে আপনি নিজেকে সম্পূর্ণ সুস্থ রেখে অন্য একজন মানুষের জীবন বাঁচাতে পারেন।",
      cta: "আজই DonateLife BD-তে আপনার পরবর্তী রক্তদানের শিডিউল নিশ্চিত করুন এবং আমাদের পুষ্টি বিষয়ক টিপসগুলো লুফে নিন।"
    }
  },
  {
    id: "blood-groups-compatibility",
    slug: "blood-groups-and-compatibility-explained",
    category: "Health & Science",
    tags: ["Blood Types", "Compatibility Chart", "Medical Science"],
    featuredImageIdea: "A beautifully structured chemical matrix display representing antigen interactions, Rh factors, and direct donation compatibility paths.",
    en: {
      seoTitle: "Blood Groups and Compatibility Explained | DonateLife BD",
      metaTitle: "Blood Type Compatibility Chart & Donor Matching Guide",
      metaDescription: "Understand the biological science behind ABO blood groups and Rh factors. View our complete compatibility chart to see who you can donate to.",
      introduction: "Have you ever wondered why your blood group is O positive, A negative, or AB positive? These letters and symbols are not random; they represent complex antigens coating your red blood cells. Understanding blood type compatibility is the foundation of modern transfusion medicine. Let's break down the science of blood groups and explore our complete, easy-to-read compatibility matrix.",
      tableOfContents: [
        { label: "The Biology of Blood Groups (ABO System)", anchor: "abo" },
        { label: "The Rh Factor: Positive vs. Negative", anchor: "rh" },
        { label: "Complete Blood Compatibility Matrix", anchor: "matrix" },
        { label: "The Universal Donor and Recipient", anchor: "universal" },
        { label: "Medical Screening Protocols", anchor: "protocols" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "The Biology of Blood Groups (ABO System)",
          text: "Our blood contains red blood cells, white blood cells, platelets, and plasma. The surface of your red blood cells is coated with microscopically tiny protein molecules called antigens. The ABO blood group system classifies blood into four major categories based on the presence or absence of these A and B antigens:"
        },
        {
          type: "bullet",
          items: [
            "Group A: Your red blood cells have A antigens, and your plasma contains Anti-B antibodies.",
            "Group B: Your cells have B antigens, and your plasma contains Anti-A antibodies.",
            "Group AB: Your cells have both A and B antigens, and your plasma has no antibodies. This makes AB individuals highly adaptable.",
            "Group O: Your cells have neither A nor B antigens, but your plasma contains both Anti-A and Anti-B antibodies."
          ]
        },
        {
          type: "h2",
          heading: "The Rh Factor: Positive vs. Negative",
          text: "In addition to the ABO antigens, there is another critical protein called the Rh (Rhesus) factor. If this protein is present on your red blood cells, you are Rh-positive (+). If it is absent, you are Rh-negative (-). This results in the eight common blood groups that exist worldwide: A+, A-, B+, B-, AB+, AB-, O+, and O-."
        },
        {
          type: "h2",
          heading: "Complete Blood Compatibility Matrix",
          text: "During a transfusion, the recipient's immune system will attack any infused red blood cells that have foreign antigens. For example, if an O-type patient receives B-type blood, their Anti-B antibodies will instantly attack and destroy the new cells, causing a fatal transfusion reaction. Refer to this official compatibility chart:"
        },
        {
          type: "table",
          tableHeaders: ["Blood Type", "Can Receive Red Blood Cells From", "Can Donate Red Blood Cells To"],
          tableRows: [
            ["O Negative (O-)", "O-", "ALL Blood Types (Universal Donor)"],
            ["O Positive (O+)", "O+, O-", "O+, A+, B+, AB+"],
            ["A Negative (A-)", "A-, O-", "A-, A+, AB-, AB+"],
            ["A Positive (A+)", "A+, A-, O+, O-", "A+, AB+"],
            ["B Negative (B-)", "B-, O-", "B-, B+, AB-, AB+"],
            ["B Positive (B+)", "B+, B-, O+, O-", "B+, AB+"],
            ["AB Negative (AB-)", "AB-, A-, B-, O-", "AB-, AB+"],
            ["AB Positive (AB+)", "ALL Blood Types (Universal Recipient)", "AB+ Only"]
          ]
        },
        {
          type: "h2",
          heading: "The Universal Donor and Recipient",
          text: "Let's explore the two unique blood groups that hold special clinical importance in emergencies:"
        },
        {
          type: "bullet",
          items: [
            "O Negative (O-) is the Universal Donor. Because O- red blood cells have zero A, B, or Rh antigens on their surface, any human body can receive this blood without triggering an immune rejection. In critical trauma surgeries where there is no time to test the patient's blood type, doctors immediately transfuse O- negative blood.",
            "AB Positive (AB+) is the Universal Recipient. Because AB+ individuals have A, B, and Rh antigens, their plasma does not contain any antibodies that would attack foreign cells. They can safely receive red blood cells from any of the eight blood groups."
          ]
        },
        {
          type: "callout",
          text: "Did You Know? Rh-negative blood is extremely rare in Bangladesh, representing less than 1% of the population. If you have an Rh-negative blood type (A-, B-, O-, AB-), your donation is exceptionally critical!"
        }
      ],
      faqs: [
        {
          question: "Can two O-positive parents have an O-negative child?",
          answer: "Yes, they can. The Rh-negative gene is recessive. If both parents carry a silent Rh-negative gene, their child can inherit the negative factor and be O-negative."
        },
        {
          question: "Why is AB-positive blood called the universal recipient?",
          answer: "Because an AB-positive person's immune system has already 'seen' all major antigens (A, B, and Rh). Therefore, it will not recognize blood from any donor as foreign, making transfusions 100% safe."
        }
      ],
      conclusion: "Understanding blood compatibility is not just academic; it is the science that keeps patients safe every single day. Knowing your blood type and how it fits into this matrix empowers you to make a targeted difference.",
      cta: "Find out your blood group and register on DonateLife BD to receive notifications when patients with matching blood types are in need."
    },
    bn: {
      seoTitle: "রক্তের গ্রুপ ও সামঞ্জস্যতা সহজ ব্যাখ্যা | DonateLife BD",
      metaTitle: "ব্লাড গ্রুপ ম্যাচিং গাইড - রক্ত কার সাথে কার মিলবে",
      metaDescription: "ABO ব্লাড গ্রুপ এবং আরএইচ (Rh) ফ্যাক্টরের পেছনের বিজ্ঞানটি জানুন। আমাদের সহজ চার্টটি দেখে বুঝে নিন আপনি কাকে রক্ত দিতে পারবেন এবং কার থেকে নিতে পারবেন।",
      introduction: "আপনি কি কখনো ভেবে দেখেছেন কেন কারো রক্তের গ্রুপ O পজিটিভ, কারো A নেগেটিভ, আবার কারো AB পজিটিভ হয়? এই প্রতীকগুলো কিন্তু এলোমেলো নয়; এগুলো আপনার লোহিত রক্তকণিকায় থাকা অ্যান্টিজেনের উপস্থিতি নির্দেশ করে। রক্তের গ্রুপের এই সামঞ্জস্যতা বা ম্যাচিং আধুনিক চিকিৎসাবিজ্ঞানের মূল ভিত্তি। চলুন সহজ ভাষায় রক্তের গ্রুপের পেছনের বিজ্ঞানটি জেনে নিই।",
      tableOfContents: [
        { label: "রক্তের গ্রুপের বিজ্ঞান (ABO সিস্টেম)", anchor: "abo" },
        { label: "আরএইচ ফ্যাক্টর: পজিটিভ বনাম নেগেটিভ", anchor: "rh" },
        { label: "রক্তের সামঞ্জস্যতা বা ম্যাচিং চার্ট", anchor: "matrix" },
        { label: "সার্বজনীন দাতা ও সার্বজনীন গ্রহীতা", anchor: "universal" },
        { label: "জরুরী মুহূর্তে রক্তের গুরুত্ব", anchor: "protocols" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "রক্তের গ্রুপের বিজ্ঞান (ABO সিস্টেম)",
          text: "আমাদের রক্তে লোহিত রক্তকণিকা, শ্বেত রক্তকণিকা, প্লেটলেট এবং প্লাজমা থাকে। লোহিত রক্তকণিকার উপরিভাগে থাকা প্রোটিন কণিকাকে অ্যান্টিজেন বলা হয়। ABO ব্লাড গ্রুপ সিস্টেম রক্তকে এই অ্যান্টিজেনের ভিত্তিতে ৪টি প্রধান ভাগে ভাগ করে:"
        },
        {
          type: "bullet",
          items: [
            "গ্রুপ A: লোহিত রক্তকণিকায় A অ্যান্টিজেন থাকে এবং প্লাজমায় Anti-B অ্যান্টিবডি থাকে।",
            "গ্রুপ B: লোহিত রক্তকণিকায় B অ্যান্টিজেন থাকে এবং প্লাজমায় Anti-A অ্যান্টিবডি থাকে।",
            "গ্রুপ AB: লোহিত রক্তকণিকায় A এবং B উভয় অ্যান্টিজেনই থাকে এবং প্লাজমায় কোনো অ্যান্টিবডি থাকে না।",
            "গ্রুপ O: লোহিত রক্তকণিকায় A বা B কোনো অ্যান্টিজেনই থাকে না, তবে প্লাজমায় Anti-A ও Anti-B উভয় অ্যান্টিবডি থাকে।"
          ]
        },
        {
          type: "h2",
          heading: "আরএইচ ফ্যাক্টর: পজিটিভ বনাম নেগেটিভ",
          text: "ABO অ্যান্টিজেন ছাড়াও লোহিত রক্তকণিকার গায়ে আরেকটি গুরুত্বপূর্ণ প্রোটিন থাকে যাকে Rh (Rhesus) ফ্যাক্টর বলা হয়। এটি যার রক্তে থাকে, তার গ্রুপ পজিটিভ (+) এবং যার রক্তে থাকে না, তার গ্রুপ নেগেটিভ (-)। এই দুই সিস্টেম মিলে তৈরি হয় প্রধান ৮টি রক্তের গ্রুপ: A+, A-, B+, B-, AB+, AB-, O+, এবং O-।"
        },
        {
          type: "h2",
          heading: "রক্তের সামঞ্জস্যতা বা ম্যাচিং চার্ট",
          text: "রক্ত সঞ্চালনের সময় গ্রহীতার শরীরে ভুল গ্রুপের রক্ত দেওয়া হলে গ্রহীতার শরীরের অ্যান্টিবডিগুলো নতুন রক্তকণিকাকে আক্রমণ করে ধ্বংস করে ফেলে, যা রোগীর মৃত্যুর কারণ হতে পারে। নিচের অফিশিয়াল চার্টটি দেখুন:"
        },
        {
          type: "table",
          tableHeaders: ["রক্তের গ্রুপ", "যার থেকে রক্ত নিতে পারবে", "যাকে রক্ত দিতে পারবে"],
          tableRows: [
            ["O নেগেটিভ (O-)", "O-", "সবাইকে দিতে পারবে (সার্বজনীন দাতা)"],
            ["O পজিটিভ (O+)", "O+, O-", "O+, A+, B+, AB+"],
            ["A নেগেটিভ (A-)", "A-, O-", "A-, A+, AB-, AB+"],
            ["A পজিটিভ (A+)", "A+, A-, O+, O-", "A+, AB+"],
            ["B নেগেটিভ (B-)", "B-, O-", "B-, B+, AB-, AB+"],
            ["B পজিটিভ (B+)", "B+, B-, O+, O-", "B+, AB+"],
            ["AB নেগেটিভ (AB-)", "AB-, A-, B-, O-", "AB-, AB+"],
            ["AB পজিটিভ (AB+)", "সব গ্রুপ থেকে নিতে পারবে (সার্বজনীন গ্রহীতা)", "শুধু AB+ কে দিতে পারবে"]
          ]
        },
        {
          type: "h2",
          heading: "সার্বজনীন দাতা ও সার্বজনীন গ্রহীতা",
          text: "দুটি বিশেষ রক্তের গ্রুপ চিকিৎসাবিজ্ঞানে অত্যন্ত গুরুত্বপূর্ণ ভূমিকা পালন করে:"
        },
        {
          type: "bullet",
          items: [
            "O নেগেটিভ (O-) হলো সার্বজনীন দাতা (Universal Donor)। কারণ এই রক্তের গায়ে কোনো অ্যান্টিজেন থাকে না, তাই যেকোনো গ্রুপের মানুষ কোনো পার্শ্বপ্রতিক্রিয়া ছাড়াই এই রক্ত গ্রহণ করতে পারেন। হাসপাতালের ইমার্জেন্সিতে ব্লাড গ্রুপ টেস্ট করার সময় না থাকলে সরাসরি O- রক্ত দেওয়া হয়।",
            "AB পজিটিভ (AB+) হলো সার্বজনীন গ্রহীতা (Universal Recipient)। এই গ্রুপের মানুষ যেকোনো রক্তের গ্রুপ থেকে নিরাপদে লোহিত রক্তকণিকা গ্রহণ করতে পারেন।"
          ]
        },
        {
          type: "callout",
          text: "জানতেন কি? বাংলাদেশে নেগেটিভ রক্তের গ্রুপগুলো অত্যন্ত বিরল, জনসংখ্যার মাত্র ১% মানুষের রক্ত নেগেটিভ। তাই আপনি যদি নেগেটিভ গ্রুপের অধিকারী হন, তবে আজই DonateLife BD-তে যুক্ত হোন!"
        }
      ],
      faqs: [
        {
          question: "বাবা-মা দুজনের গ্রুপ O+ হলে সন্তানের কি O- হতে পারে?",
          answer: "হ্যাঁ, হতে পারে। নেগেটিভ আরএইচ জিনটি প্রচ্ছন্ন থাকে। বাবা-মা দুজনের সুপ্ত নেগেটিভ জিন থাকলে সন্তান তা পেয়ে O- হতে পারে।"
        },
        {
          question: "AB+ কে কেন সার্বজনীন গ্রহীতা বলা হয়?",
          answer: "কারণ AB+ রক্তে কোনো ক্ষতিকর অ্যান্টিবডি থাকে না যা অন্য কোনো অ্যান্টিজেনকে আক্রমণ করবে, ফলে সব রক্তই তাদের শরীর সহজে গ্রহণ করে।"
        }
      ],
      conclusion: "রক্তের গ্রুপের ম্যাচিং ও মিল জানলে আপনি জরুরী মুহূর্তে সঠিক সিদ্ধান্ত নিতে পারবেন। নিজের ব্লাড গ্রুপ জানা প্রতিটি নাগরিকের জন্য অত্যন্ত প্রয়োজনীয় একটি স্বাস্থ্য তথ্য।",
      cta: "আজই DonateLife BD-তে আপনার ব্লাড গ্রুপ দিয়ে রেজিস্ট্রেশন করুন এবং ম্যাচিং রক্তদাতাদের সাথে যুক্ত থাকুন।"
    }
  },
  {
    id: "thalassemia-blood-donation",
    slug: "thalassemia-and-blood-donation-bangladesh",
    category: "Life & Community",
    tags: ["Thalassemia", "Patient Stories", "Bangladesh Health"],
    featuredImageIdea: "A warm, emotional hand-drawn graphic representing a hopeful child holding a flower, connected to a supportive community red heart chain.",
    en: {
      seoTitle: "Thalassemia and the Lifesaving Importance of Blood Donation | DonateLife BD",
      metaTitle: "Thalassemia Treatment & Blood Donation Guide",
      metaDescription: "Learn how voluntary blood donation acts as the primary life support for thousands of Thalassemia patients in Bangladesh. Read their inspiring stories.",
      introduction: "In Bangladesh, over 60,000 children are currently battling Thalassemia—a genetic blood disorder that prevents their body from producing healthy hemoglobin. Without regular blood transfusions every 2 to 4 weeks, these young fighters face severe organ failure, fatigue, and life-threatening complications. This guide breaks down the science of Thalassemia and why your regular donations are the oxygen they need to survive.",
      tableOfContents: [
        { label: "What is Thalassemia?", anchor: "what-is" },
        { label: "Why Thalassemia Patients Need Constant Transfusions", anchor: "transfusions" },
        { label: "The Reality of Thalassemia in Bangladesh", anchor: "reality" },
        { label: "How Regular Donors Change Their Life Expectancy", anchor: "impact" },
        { label: "The Role of DonateLife BD", anchor: "donatelife" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "What is Thalassemia?",
          text: "Thalassemia is an inherited (genetic) disorder of the blood. It affects the body's ability to produce hemoglobin and healthy red blood cells. Hemoglobin is the iron-rich protein in red blood cells that carries oxygen from your lungs to the rest of your body. Because Thalassemia patients have fewer healthy red blood cells, they suffer from severe, chronic anemia."
        },
        {
          type: "h2",
          heading: "Why Thalassemia Patients Need Constant Transfusions",
          text: "Because their body cannot synthesize functional red blood cells, Thalassemia patients rely entirely on donor blood to deliver oxygen to their tissues. These transfusions are not a one-time cure; they must be repeated continuously throughout the patient's entire life. A typical Thalassemia patient requires 1 to 2 units of packed red blood cells every single month."
        },
        {
          type: "callout",
          text: "The Iron Accumulation Challenge: Because blood contains a lot of iron, frequent transfusions lead to iron overload in the patient's liver and heart. Patients must undergo expensive iron-chelation therapy to flush this excess iron out of their system."
        },
        {
          type: "h2",
          heading: "The Reality of Thalassemia in Bangladesh",
          text: "According to the World Health Organization (WHO), about 7% of the population in Bangladesh are carriers of the Thalassemia gene. When two carriers marry, there is a 25% chance their child will be born with Thalassemia Major. This has resulted in a massive surge of patients across the country, particularly in major hubs like Dhaka, Chattogram, and Rajshahi."
        },
        {
          type: "table",
          tableHeaders: ["Patient Age Group", "Transfusion Frequency", "Annual Blood Requirement"],
          tableRows: [
            ["Infants (0 - 2 years)", "Every 4 Weeks", "12 to 15 Bags"],
            ["Children (3 - 12 years)", "Every 3 Weeks", "18 to 22 Bags"],
            ["Teens & Adults (13+ years)", "Every 2 Weeks", "24 to 30 Bags"]
          ]
        },
        {
          type: "h2",
          heading: "How Regular Donors Save Thalassemia Children",
          text: "Finding a new blood donor every two weeks is a traumatizing experience for parents already struggling to pay for expensive medical therapies. When a voluntary donor commits to donating blood 3 or 4 times a year, they provide stability. By registering as a donor, you remove the constant fear and financial scramble that parents face, allowing these brave children to study, play, and live a beautiful life."
        }
      ],
      faqs: [
        {
          question: "Can Thalassemia be cured?",
          answer: "The only definitive cure is a bone marrow transplant, which is highly expensive and requires a perfectly matching sibling donor. Therefore, for 95% of patients in Bangladesh, lifetime blood transfusion remains the only realistic treatment."
        },
        {
          question: "What is Thalassemia trait or carrier status?",
          answer: "Thalassemia carriers lead normal, healthy lives and often do not know they carry the gene. Simple pre-marital blood tests (Hemoglobin Electrophoresis) can help prevent children from being born with Thalassemia Major."
        }
      ],
      conclusion: "Thalassemia patients do not have the luxury of waiting. For them, blood donation is not just a kind gesture—it is their active life support. Your regular donation is their breath of fresh air.",
      cta: "Stand with Thalassemia fighters. Register on DonateLife BD to match with pediatric Thalassemia clinics in Bangladesh."
    },
    bn: {
      seoTitle: "থ্যালাসেমিয়া ও নিয়মিত রক্তদানের জীবন রক্ষাকারী গুরুত্ব | DonateLife BD",
      metaTitle: "থ্যালাসেমিয়া রোগীর রক্ত সঞ্চালন ও থ্যালাসেমিয়া গাইড",
      metaDescription: "জানুন কীভাবে নিয়মিত রক্তদান বাংলাদেশের হাজার হাজার থ্যালাসেমিয়া আক্রান্ত শিশুদের বেঁচে থাকার একমাত্র অবলম্বন। থ্যালাসেমিয়ার প্রতিরোধ ও যত্ন পড়ুন।",
      introduction: "বাংলাদেশে বর্তমানে ৬০,০০০-এরও বেশি শিশু থ্যালাসেমিয়ার মতো মারাত্মক রক্তের জেনেটিক রোগের সাথে যুদ্ধ করছে। সুস্থ হিমোগ্লোবিন তৈরি করতে না পারায় প্রতি ২ থেকে ৪ সপ্তাহ পর পর নিয়মিত রক্ত গ্রহণ না করলে এই শিশুদের বেঁচে থাকা অসম্ভব। এই নির্দেশিকাতে আমরা জানবো থ্যালাসেমিয়া রোগ কী এবং আপনার এক ব্যাগ রক্ত কীভাবে এই শিশুদের সতেজ রাখে।",
      tableOfContents: [
        { label: "থ্যালাসেমিয়া রোগটি আসলে কী?", anchor: "what-is" },
        { label: "কেন নিয়মিত রক্ত সঞ্চালনের প্রয়োজন হয়", anchor: "transfusions" },
        { label: "বাংলাদেশে থ্যালাসেমিয়ার বাস্তব চিত্র", anchor: "reality" },
        { label: "নিয়মিত রক্তদাতারা যেভাবে সাহায্য করতে পারেন", anchor: "impact" },
        { label: "প্রতিরোধ ও সচেতনতা বাড়ানোর উপায়", anchor: "donatelife" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "থ্যালাসেমিয়া রোগটি আসলে কী?",
          text: "থ্যালাসেমিয়া হলো রক্তে লোহিত রক্তকণিকা ও সুস্থ হিমোগ্লোবিন তৈরি হতে না পারার একটি বংশগত বা জেনেটিক রোগ। হিমোগ্লোবিনের কাজ হলো ফুসফুস থেকে সারা শরীরে অক্সিজেন পৌঁছে দেওয়া। থ্যালাসেমিয়া রোগীর রক্তে হিমোগ্লোবিন কম থাকায় তারা তীব্র ও দীর্ঘস্থায়ী রক্তাল্পতায় ভোগে।"
        },
        {
          type: "h2",
          heading: "কেন নিয়মিত রক্ত সঞ্চালনের প্রয়োজন হয়",
          text: "যেহেতু থ্যালাসেমিয়া আক্রান্তের শরীর নিজেই সুস্থ রক্ত তৈরি করতে অক্ষম, তাই তারা অন্য দাতার রক্তের ওপর বেঁচে থাকার জন্য সম্পূর্ণ নির্ভরশীল। এটি সাময়িক কোনো চিকিৎসা নয়; রোগীকে সারা জীবন নিয়মিত বিরতিতে রক্ত গ্রহণ করতে হয়। একজন সাধারণ রোগীকে প্রতি মাসে অন্তত ১ থেকে ২ ব্যাগ রক্ত নিতে হয়।"
        },
        {
          type: "callout",
          text: "আয়রন জমার জটিলতা: ঘন ঘন রক্ত নেওয়ার ফলে রোগীর হৃৎপিণ্ড ও লিভারে অতিরিক্ত আয়রন জমা হয়, যা প্রতিহত করতে রোগীদের অত্যন্ত ব্যয়বহুল আয়রন নিষ্কাশন বা চিলেশন থেরাপি নিতে হয়।"
        },
        {
          type: "h2",
          heading: "বাংলাদেশে থ্যালাসেমিয়ার বাস্তব চিত্র",
          text: "বিশ্ব স্বাস্থ্য সংস্থার (WHO) তথ্য অনুযায়ী, বাংলাদেশের মোট জনসংখ্যার প্রায় ৭% মানুষ থ্যালাসেমিয়া রোগের নীরব বাহক। যখন দুজন বাহকের মধ্যে বিয়ে হয়, তখন তাদের সন্তানের থ্যালাসেমিয়া মেজর বা মারাত্মক রোগ নিয়ে জন্ম নেওয়ার ২৫% আশঙ্কা থাকে।"
        },
        {
          type: "table",
          tableHeaders: ["রোগীর বয়সসীমা", "রক্ত গ্রহণের প্রয়োজনীয়তা", "বছরে মোট রক্তের চাহিদা"],
          tableRows: [
            ["শিশু (০ - ২ বছর)", "প্রতি ৪ সপ্তাহে একবার", "১২ থেকে ১৫ ব্যাগ"],
            ["কিশোর (৩ - ১২ বছর)", "প্রতি ৩ সপ্তাহে একবার", "১৮ থেকে ২২ ব্যাগ"],
            ["বয়স্ক (১৩+ বছর)", "প্রতি ২ সপ্তাহে একবার", "২৪ থেকে ৩০ ব্যাগ"]
          ]
        },
        {
          type: "h2",
          heading: "নিয়মিত রক্তদাতারা যেভাবে সাহায্য করতে পারেন",
          text: "প্রতি দুই সপ্তাহ পর পর নতুন রক্তদাতা খুঁজে বেড়ানো একটি অসহায় পরিবারের জন্য অত্যন্ত কষ্টদায়ক ও মানসিক যন্ত্রণার কারণ। যখন কোনো রক্তদাতা বছরে ৩-৪ বার রক্ত দেওয়ার অঙ্গীকার করেন, তখন একটি থ্যালাসেমিয়া আক্রান্ত শিশু নিশ্চিন্তে স্কুলে যেতে পারে, খেলতে পারে এবং নতুন স্বপ্ন দেখতে পারে।"
        }
      ],
      faqs: [
        {
          question: "থ্যালাসেমিয়া কি পুরোপুরি নিরাময় সম্ভব?",
          answer: "অস্থিমজ্জা প্রতিস্থাপন (Bone Marrow Transplant) থ্যালাসেমিয়ার একমাত্র স্থায়ী চিকিৎসা, যা অত্যন্ত ব্যয়বহুল এবং উপযুক্ত ম্যাচিং দাতা খুঁজে পাওয়া কঠিন। তাই রক্ত সঞ্চালনই অধিকাংশ রোগীর প্রধান জীবন রক্ষাকারী অবলম্বন।"
        },
        {
          question: "থ্যালাসেমিয়া বাহক হওয়া মানে কী?",
          answer: "থ্যালাসেমিয়া বাহকেরা সম্পূর্ণ সুস্থ ও স্বাভাবিক জীবনযাপন করেন। বিয়ের পূর্বে একটি সাধারণ রক্তের টেস্ট (হিমোগ্লোবিন ইলেক্ট্রোফোরেসিস) করার মাধ্যমে পরবর্তী প্রজন্মে এই রোগ প্রতিরোধ করা সম্ভব।"
        }
      ],
      conclusion: "থ্যালাসেমিয়া আক্রান্ত শিশুদের অপেক্ষা করার সময় নেই। আপনার এক ব্যাগ রক্ত তাদের বেঁচে থাকার অক্সিজেন। আজই আপনার রক্তদান দিয়ে তাদের একটি নতুন দিন উপহার দিন।",
      cta: "থ্যালাসেমিয়া আক্রান্ত শিশুদের পাশে দাঁড়ান। আজই DonateLife BD-তে রক্তদাতা হিসেবে যুক্ত হয়ে জীবন বাঁচান।"
    }
  },
  {
    id: "blood-donation-myths-facts",
    slug: "blood-donation-myths-vs-facts-safety",
    category: "General",
    tags: ["Myths vs Facts", "Education", "Donor Awareness"],
    featuredImageIdea: "A visual grid structure contrasting popular blood donation myths with solid medically verified facts in simple card layout.",
    en: {
      seoTitle: "Blood Donation Myths vs. Facts: Clearing the Misconceptions | DonateLife BD",
      metaTitle: "10 Blood Donation Myths Debunked - Verified Facts",
      metaDescription: "Do you believe donating blood makes you permanently weak, takes hours, or causes infections? Read our medical guide exposing common blood donation myths.",
      introduction: "Despite being a scientifically safe and simple medical procedure, blood donation in Bangladesh is surrounded by dozens of outdated myths. These false beliefs create unnecessary fear, keeping hundreds of prospective donors away. At DonateLife BD, we believe in scientific education. Let's debunk the top 10 most common blood donation myths with solid medical facts.",
      tableOfContents: [
        { label: "Myth 1: Donating Blood Makes You Permanently Weak", anchor: "myth1" },
        { label: "Myth 2: It Takes Too Much Time", anchor: "myth2" },
        { label: "Myth 3: I Can Catch Diseases From Needle Use", anchor: "myth3" },
        { label: "Myth 4: People on Medication Cannot Donate", anchor: "myth4" },
        { label: "Myth 5: Women Should Not Donate Blood", anchor: "myth5" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "Myth 1: Donating Blood Makes You Permanently Weak",
          text: "Fact: This is the most common myth in Bangladesh. The average adult has about 5 liters of blood in their body. A standard donation takes only 350-450 ml, which is less than 10% of your total blood volume. Your body replaces the fluid volume within 24 to 48 hours, and your bone marrow rapidly synthesizes brand-new red blood cells. There is absolutely no permanent weakness or loss of stamina."
        },
        {
          type: "h2",
          heading: "Myth 2: It Takes Too Much Time",
          text: "Fact: Many people assume that donating blood will ruin their entire workday. In reality, the active blood collection process takes only 8 to 10 minutes. The entire process—including registration, physical vitals check, and resting afterward—is fully completed in less than 30 to 45 minutes."
        },
        {
          type: "h2",
          heading: "Myth 3: I Can Catch Diseases From Needle Use",
          text: "Fact: In modern clinical practice, contracted infections from donating are physically impossible. Every blood donor organization in Bangladesh, including DonateLife BD partners, uses sterile, single-use disposable needles that are unpacked in front of the donor and discarded immediately after. There is zero risk of catching HIV, Hepatitis, or any other bloodborne pathogen."
        },
        {
          type: "h2",
          heading: "Myth 4: People on Medication Cannot Donate",
          text: "Fact: While some medications (like active chemotherapy, blood thinners, or heavy immunosuppressants) defer you, many common medications do not. For example, people taking daily blood pressure pills, vitamins, thyroid hormone replacements, or oral diabetes medications can safely donate, provided their conditions are stable on the day of donation."
        },
        {
          type: "h2",
          heading: "Myth 5: Women Should Not Donate Blood",
          text: "Fact: Any healthy woman between 18 and 60 who weighs at least 45 kg and has a hemoglobin level above 12.5 g/dL can safely donate blood. While women are deferred during pregnancy and active breastfeeding to protect their health, thousands of healthy Bangladeshi women donate blood regularly and experience great cardiovascular health."
        }
      ],
      faqs: [
        {
          question: "Can I donate blood if I have a mild cold?",
          answer: "If you have a minor cold but no active fever, you should wait until all symptoms (runny nose, coughing) have completely cleared for 7 days before donating."
        },
        {
          question: "Will donating blood affect my eyesight or immune system?",
          answer: "No. There is zero clinical connection between blood donation and eyesight. In fact, donating blood stimulates fresh cell production, which rejuvenates your body's immune defense system."
        }
      ],
      conclusion: "Do not let outdated misconceptions stop you from saving lives. By relying on modern science, we can defeat fear and build a strong community of voluntary blood donors in Bangladesh.",
      cta: "Help us spread scientific awareness. Register as a donor on DonateLife BD and share this myths vs facts guide with your friends."
    },
    bn: {
      seoTitle: "রক্তদান নিয়ে প্রচলিত ১০টি ভুল ধারণা ও সত্য তথ্য | DonateLife BD",
      metaTitle: "রক্তদানের কুসংস্কার ও সমাধান - বৈজ্ঞানিক গাইড",
      metaDescription: "রক্ত দিলে কি শরীর দুর্বল হয়? রোগ ছড়ায়? রক্তদান নিয়ে আমাদের সমাজে প্রচলিত নানা কুসংস্কারের বৈজ্ঞানিক ও তাত্ত্বিক সত্য বিশ্লেষণ পড়ুন।",
      introduction: "একটি বৈজ্ঞানিকভাবে নিরাপদ ও অত্যন্ত সহজ প্রক্রিয়া হওয়া সত্ত্বেও বাংলাদেশে রক্তদান নিয়ে অসংখ্য ভুল ধারণা প্রচলিত রয়েছে। এই অন্ধবিশ্বাসগুলো মানুষের মনে অহেতুক ভীতি সৃষ্টি করে, যার ফলে অনেক সম্ভাব্য দাতা পিছিয়ে যান। DonateLife BD সব সময়ই বৈজ্ঞানিক সচেতনতায় বিশ্বাস করে। চলুন প্রচলিত ৫টি প্রধান ভুল ধারণা ও তাদের আসল সত্য জেনে নিই।",
      tableOfContents: [
        { label: "ভুল ধারণা ১: রক্ত দিলে শরীর স্থায়ীভাবে দুর্বল হয়ে পড়ে", anchor: "myth1" },
        { label: "ভুল ধারণা ২: রক্ত দিতে অনেক সময় নষ্ট হয়", anchor: "myth2" },
        { label: "ভুল ধারণা ৩: রক্ত দেওয়ার সময় রোগ ছড়াতে পারে", anchor: "myth3" },
        { label: "ভুল ধারণা ৪: ওষুধ খাওয়া অবস্থায় রক্ত দেওয়া যায় না", anchor: "myth4" },
        { label: "ভুল ধারণা ৫: নারীদের রক্ত দেওয়া উচিত নয়", anchor: "myth5" }
      ],
      fullArticle: [
        {
          type: "h2",
          heading: "ভুল ধারণা ১: রক্ত দিলে শরীর স্থায়ীভাবে দুর্বল হয়ে পড়ে",
          text: "আসল সত্য: এটি আমাদের দেশের সবচেয়ে বড় কুসংস্কার। একজন সুস্থ প্রাপ্তবয়স্ক মানুষের শরীরে প্রায় ৫ লিটার রক্ত থাকে। রক্তদানের সময় মাত্র ৩৫০-৪৫০ মিলি রক্ত নেওয়া হয়, যা মোট রক্তের ১০% এরও কম। আপনার শরীরের তরল অংশ ২৪ থেকে ৪৮ ঘণ্টার মধ্যে পূরণ হয়ে যায় এবং অস্থিমজ্জা খুব দ্রুত নতুন রক্ত তৈরি করে। এর ফলে কোনো দুর্বলতা হয় না।"
        },
        {
          type: "h2",
          heading: "ভুল ধারণা ২: রক্ত দিতে অনেক সময় নষ্ট হয়",
          text: "আসল সত্য: অনেকে মনে করেন রক্তদান করতে গেলে সারা দিন নষ্ট হবে। কিন্তু প্রকৃতপক্ষে সুঁইয়ের মাধ্যমে রক্ত নেওয়ার মূল পর্বটিতে মাত্র ৮ থেকে ১০ মিনিট সময় লাগে। নিবন্ধন ও বিশ্রামের সময়সহ পুরো প্রক্রিয়াটি সম্পন্ন হতে সর্বোচ্চ ৩০ থেকে ৪৫ মিনিট সময় লাগে।"
        },
        {
          type: "h2",
          heading: "ভুল ধারণা ৩: রক্ত দেওয়ার সময় রোগ ছড়াতে পারে",
          text: "আসল সত্য: আধুনিক চিকিৎসায় রক্তদানের মাধ্যমে কোনো রোগ ছড়ানো সম্পূর্ণ অসম্ভব। রক্তদানে ব্যবহৃত প্রতিটি সুঁই ও সরঞ্জাম ওয়ান-টাইম এবং আপনার সামনেই নতুন প্যাকেট থেকে খোলা হয়। একবার ব্যবহারের পরই তা ধ্বংস করে ফেলা হয়। তাই এইচআইভি বা হেপাটাইটিসের মতো রোগ ছড়ানোর কোনো সুযোগ নেই।"
        },
        {
          type: "h2",
          heading: "ভুল ধারণা ৪: ওষুধ খাওয়া অবস্থায় রক্ত দেওয়া যায় না",
          text: "আসল সত্য: ক্যানসার বা রক্ত পাতলা করার ওষুধের মতো কিছু নির্দিষ্ট ওষুধ ছাড়া অনেক সাধারণ ওষুধ খাওয়া অবস্থায় রক্ত দেওয়া যায়। যেমন রক্তচাপের ওষুধ, ভিটামিন সাপ্লিমেন্ট বা মুখে খাওয়ার ডায়াবেটিসের ওষুধ খাওয়া অবস্থায় আপনার ভাইটাল স্বাভাবিক থাকলে আপনি রক্ত দিতে পারবেন।"
        },
        {
          type: "h2",
          heading: "ভুল ধারণা ৫: নারীদের রক্ত দেওয়া উচিত নয়",
          text: "আসল সত্য: যেকোনো সুস্থ নারী যাদের বয়স ১৮-৬০ বছর, ওজন ৪৫ কেজির ওপরে এবং হিমোগ্লোবিনের মাত্রা ১২.৫ g/dL এর বেশি তারা নিরাপদে রক্ত দিতে পারেন। গর্ভাবস্থা এবং বুকের দুধ খাওয়ানোর সময় ছাড়া স্বাভাবিক অবস্থায় সুস্থ নারীরা নিয়মিত রক্ত দিতে পারেন এবং এটি তাদের হার্টকে ভালো রাখে।"
        }
      ],
      faqs: [
        {
          question: "রক্ত দিলে কি চোখের দৃষ্টিশক্তি কমে?",
          answer: "একেবারেই না। চোখের দৃষ্টির সাথে রক্তদানের চিকিৎসাগত কোনো সম্পর্ক নেই। এটি একটি ভিত্তিহীন গুজব।"
        },
        {
          question: "রক্ত দেওয়ার পর কি আমার রোগ প্রতিরোধ ক্ষমতা কমে যাবে?",
          answer: "না, বরং রক্ত দেওয়ার পর শরীর যখন নতুন ও সতেজ রক্তকণিকা তৈরি করে, তখন আপনার শরীরের রোগ প্রতিরোধ ক্ষমতা আরও শক্তিশালী ও সতেজ হয়ে ওঠে।"
        }
      ],
      conclusion: "কুসংস্কারকে পেছনে ফেলে বিজ্ঞানের আলোয় পথ চলুন। সঠিক তথ্যের প্রচার ও সচেতনতা বৃদ্ধির মাধ্যমেই আমরা রক্তদানের ভীতি দূর করতে পারি এবং রক্তসংকট রুখতে পারি।",
      cta: "কুসংস্কার রুখতে সাহায্য করুন। আজই DonateLife BD-তে একজন গর্বিত রক্তদাতা হিসেবে নাম লেখান এবং এই গাইডটি সবার সাথে শেয়ার করুন।"
    }
  }
];
