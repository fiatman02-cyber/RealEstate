#!/usr/bin/env bash
# =============================================================================
#  FiatKopong — สคริปต์ประกอบหน้าเว็บ
# -----------------------------------------------------------------------------
#  ใช้ทำอะไร:  ประกอบ header/footer จาก _partials/ เข้ากับเนื้อหาแต่ละหน้า
#              เพื่อไม่ต้องก็อปวางเมนูเองทีละไฟล์
#
#  วิธีใช้:    bash _partials/build.sh
#              (รันจากโฟลเดอร์หลักของเว็บ)
#
#  หมายเหตุ:   index.html และ about-me.html เขียนมือ สคริปต์นี้ "ไม่แตะ"
#              เนื้อหาของแต่ละหน้าอยู่ใน _partials/body/<ชื่อหน้า>.html
#              ถ้าไม่มีไฟล์ body สคริปต์จะสร้างหน้าโครงร่างให้อัตโนมัติ
# =============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."

ROOT="$(pwd)"
SITE="https://fiatkopong.com"     # << เปลี่ยนเป็นโดเมนจริงเมื่อขึ้นเว็บ
P="_partials"
mkdir -p "$P/body"

# ---------------------------------------------------------------------------
# ตารางหน้าเว็บ:  slug | navKey | title | description | h1 | lead
# ---------------------------------------------------------------------------
PAGES=$(cat <<'TABLE'
products|products|บริการทั้งหมด|ภาพรวมบริการทั้งสี่ของ FiatKopong — คอร์สเรียน บทวิเคราะห์ตลาด Dashboard เฉพาะลูกค้า และที่ปรึกษาธุรกิจอสังหาริมทรัพย์|บริการทั้งหมด|สี่ทางเข้าสำหรับสี่แบบของคนที่ต้องตัดสินใจ เลือกจากจุดที่ตรงกับปัญหาคุณที่สุด
courses|products|คอร์สเรียนอสังหาริมทรัพย์|คอร์สเรียนอสังหาริมทรัพย์ที่สอนให้คุณอ่านตลาดเองได้ ตั้งแต่พื้นฐานราคาตลาดจริง ไปจนถึงการประเมินความเป็นไปได้ของโปรเจกต์|คอร์สเรียนอสังหาริมทรัพย์|เป้าหมายของคอร์สคือให้คุณเลิกต้องพึ่งผม ไม่ใช่ให้กลับมาซื้อคำแนะนำเรื่อยๆ
course-detail|products|รายละเอียดคอร์ส|รายละเอียดคอร์สเรียนอสังหาริมทรัพย์ เนื้อหาแต่ละบท สิ่งที่ได้รับ ตารางเรียน และวิธีสมัคร|รายละเอียดคอร์ส|เนื้อหาทุกบท สิ่งที่คุณจะทำได้หลังเรียนจบ และเงื่อนไขคืนเงิน
reports|products|บทวิเคราะห์ &amp; สถิติตลาด|คลังรายงานวิเคราะห์สถานการณ์อสังหาริมทรัพย์ไทย มีทั้งฉบับอ่านฟรีและฉบับสำหรับสมาชิก ทุกตัวเลขระบุแหล่งที่มา|บทวิเคราะห์ &amp; สถิติตลาด|คลังรายงานที่บอกที่มาของทุกตัวเลข เพื่อให้คุณย้อนไปตรวจเองได้
dashboards|products|Dashboard เฉพาะลูกค้า|บริการออกแบบ Dashboard และเว็บไซต์ติดตามข้อมูลอสังหาริมทรัพย์เฉพาะลูกค้า พร้อมตัวอย่างผลงานและฟอร์มขอ demo|Dashboard เฉพาะลูกค้า|ให้ระบบติดตามตลาดแทนคุณ 24 ชั่วโมง แทนการนั่งไล่หาข่าวเองทุกครั้ง
consult|products|จองคำปรึกษาธุรกิจอสังหาริมทรัพย์|จองเวลาปรึกษาธุรกิจอสังหาริมทรัพย์ตัวต่อตัวกับก่อพงศ์ ลีเจริญพิสิฐ ครั้งแรกฟรี 30 นาที ไม่มีการขายในสาย|จองคำปรึกษา|ครั้งแรกฟรี 30 นาที ถ้าเรื่องของคุณไม่ตรงกับที่เราช่วยได้ ผมจะบอกตรงๆ
location-intelligence|li|Location IQ — คะแนนทำเลแบบเจาะจุด|แผนที่ให้คะแนนทำเลอสังหาริมทรัพย์ 5 มิติ — แนวโน้มราคา ระบบขนส่ง แผนพัฒนา ความเสี่ยง และแรงกดดันจากซัพพลาย|Location IQ|คะแนนทำเล 5 มิติ พร้อมวิธีคิดที่เปิดให้ตรวจสอบได้ทุกขั้นตอน
articles|articles|บทความ &amp; ข่าวอสังหาริมทรัพย์|ข่าวและบทวิเคราะห์อสังหาริมทรัพย์ไทย สรุปด้วยถ้อยคำของเราเอง พร้อมลิงก์แหล่งอ้างอิงและคะแนนความน่าเชื่อถือทุกชิ้น|บทความ &amp; ข่าว|เราสรุปด้วยคำพูดของเราเอง ลิงก์กลับต้นทางเสมอ และให้คะแนนความน่าเชื่อถือทุกชิ้น
article-detail|articles|รายละเอียดบทความ|บทวิเคราะห์ฉบับเต็ม พร้อมแหล่งอ้างอิง คะแนนความน่าเชื่อถือ และพื้นที่แสดงความคิดเห็น|รายละเอียดบทความ|อ่านฉบับเต็ม ตรวจแหล่งอ้างอิง และร่วมแสดงความเห็นได้ท้ายบทความ
about-us|about|เกี่ยวกับเรา &amp; พาร์ทเนอร์|ที่มาของธุรกิจ พันธกิจ วิธีทำงาน และเครือข่ายพาร์ทเนอร์ของ FiatKopong|เกี่ยวกับเรา &amp; พาร์ทเนอร์|ที่มาของธุรกิจ พันธกิจ และเครือข่ายที่ทำงานร่วมกัน
testimonials|about|เสียงจากผู้ใช้จริง|รีวิวจากผู้เรียนคอร์สและลูกค้างานที่ปรึกษาของ FiatKopong พร้อมผลลัพธ์ที่วัดได้|เสียงจากผู้ใช้จริง|คนที่เปลี่ยนวิธีตัดสินใจไปแล้ว และสิ่งที่เปลี่ยนจริงในตัวเลขของเขา
faq|faq|คำถามที่พบบ่อย|รวมคำถามที่พบบ่อยเรื่องคอร์สเรียน รายงานวิเคราะห์ Dashboard งานที่ปรึกษา และวิธีที่เราจัดการเรื่องแหล่งข้อมูลกับลิขสิทธิ์|คำถามที่พบบ่อย|ตอบตรงๆ ทั้งเรื่องราคา ขอบเขตงาน และข้อจำกัดของข้อมูลที่เราใช้
contact|contact|ติดต่อ &amp; จองเวลา|ช่องทางติดต่อ FiatKopong ฟอร์มติดต่อ และลิงก์โซเชียล Facebook / Instagram FFiat Kopong|ติดต่อเรา|ส่งคำถามมาก่อนก็ได้ หรือจองเวลาคุยกันเลย
privacy|contact|นโยบายความเป็นส่วนตัว|นโยบายความเป็นส่วนตัวของเว็บไซต์ FiatKopong — ข้อมูลที่เก็บ วัตถุประสงค์ และสิทธิของเจ้าของข้อมูล|นโยบายความเป็นส่วนตัว|เราเก็บข้อมูลเท่าที่จำเป็น และไม่ขายอีเมลของคุณให้ใคร
terms|contact|เงื่อนไขการใช้งาน|เงื่อนไขการใช้งานเว็บไซต์ FiatKopong รวมถึงข้อจำกัดความรับผิดและนโยบายการอ้างอิงเนื้อหาข่าว|เงื่อนไขการใช้งาน|ขอบเขตการใช้เนื้อหา ข้อจำกัดความรับผิด และวิธีที่เราอ้างอิงข่าวจากแหล่งอื่น
accessibility|contact|การเข้าถึงเว็บไซต์|แนวทางการทำให้เว็บไซต์ FiatKopong เข้าถึงได้ตามมาตรฐาน WCAG 2.1 ระดับ AA และช่องทางแจ้งปัญหาการใช้งาน|การเข้าถึงเว็บไซต์|เราตั้งใจให้ทุกคนใช้เว็บนี้ได้ รวมถึงผู้ใช้คีย์บอร์ดและโปรแกรมอ่านหน้าจอ
TABLE
)

HEADER_HTML="$(cat "$P/header.html")"
FOOTER_HTML="$(cat "$P/footer.html")"

count=0
while IFS='|' read -r slug nav title desc h1 lead; do
  [ -z "${slug:-}" ] && continue
  count=$((count+1))

  # ----- เนื้อหาหลักของหน้า -----
  if [ -f "$P/body/$slug.html" ]; then
    BODY="$(cat "$P/body/$slug.html")"
  else
    BODY="$(cat <<BODYEOF
  <section class="section">
    <div class="container container--narrow">
      <div class="panel">
        <p class="eyebrow">อยู่ในคิวถัดไป</p>
        <h2 class="mt-3">หน้านี้กำลังจัดทำเนื้อหา</h2>
        <p class="mt-4 muted">
          โครงหน้า เมนู ดีไซน์ และระบบทั้งหมดพร้อมแล้ว เหลือเติมเนื้อหาส่วนกลางของหน้านี้
          — วางเนื้อหาไว้ที่ <code>_partials/body/$slug.html</code> แล้วรัน
          <code>bash _partials/build.sh</code> เนื้อหาจะขึ้นแทนกล่องนี้ทันที
        </p>
        <div class="cluster mt-6">
          <a class="btn btn--gold" href="consult.html">จองคำปรึกษาฟรี</a>
          <a class="btn btn--outline" href="index.html">กลับหน้าแรก</a>
        </div>
      </div>
    </div>
  </section>
BODYEOF
)"
  fi

  # ----- ป้าย aria-current ของเมนู -----
  HDR="$HEADER_HTML"
  for key in home about products li articles faq contact; do
    if [ "$key" = "$nav" ]; then
      HDR="${HDR//%%CUR_$key%%/aria-current=\"page\"}"
    else
      HDR="${HDR//%%CUR_$key%%/}"
    fi
  done

  # ----- เขียนไฟล์ -----
  {
    cat <<HEADEOF
<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">

<title>$title | FiatKopong</title>
<meta name="description" content="$desc">
<meta name="author" content="ก่อพงศ์ ลีเจริญพิสิฐ">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="canonical" href="$SITE/$slug.html">

<meta property="og:type" content="website">
<meta property="og:locale" content="th_TH">
<meta property="og:site_name" content="FiatKopong — Real Estate Intelligence">
<meta property="og:title" content="$title | FiatKopong">
<meta property="og:description" content="$desc">
<meta property="og:url" content="$SITE/$slug.html">
<meta property="og:image" content="$SITE/Resource/images/og/og-default.svg">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="$SITE/Resource/images/og/og-default.svg">
<meta name="theme-color" content="#0A1428">

<link rel="icon" href="Resource/images/brand/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="Resource/images/brand/favicon.svg">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:wght@400;500;600;700&family=Noto+Serif+Thai:wght@600;700&family=Playfair+Display:wght@600;700&family=IBM+Plex+Mono:wght@400;600&display=swap" rel="stylesheet">

<link rel="stylesheet" href="assets/css/base.css">
<link rel="stylesheet" href="assets/css/components.css">

<script type="application/ld+json">
{
  "@context":"https://schema.org",
  "@type":"WebPage",
  "name":"$title",
  "description":"$desc",
  "url":"$SITE/$slug.html",
  "inLanguage":"th-TH",
  "isPartOf":{"@type":"WebSite","name":"FiatKopong","url":"$SITE/"},
  "breadcrumb":{
    "@type":"BreadcrumbList",
    "itemListElement":[
      {"@type":"ListItem","position":1,"name":"หน้าแรก","item":"$SITE/"},
      {"@type":"ListItem","position":2,"name":"$title","item":"$SITE/$slug.html"}
    ]
  }
}
</script>
</head>

<body>
HEADEOF

    printf '%s\n' "$HDR"

    cat <<PHEADEOF

<main id="main">
  <section class="page-head">
    <div class="container">
      <nav aria-label="เส้นทางนำทาง">
        <ol class="crumbs">
          <li><a href="index.html">หน้าแรก</a></li>
          <li>$title</li>
        </ol>
      </nav>
      <p class="eyebrow mt-4">FiatKopong</p>
      <h1>$h1</h1>
      <p class="lead">$lead</p>
    </div>
  </section>

PHEADEOF

    printf '%s\n' "$BODY"

    printf '%s\n' "</main>"
    printf '%s\n' ""
    printf '%s\n' "$FOOTER_HTML"
    printf '%s\n' "</body>"
    printf '%s\n' "</html>"
  } > "$ROOT/$slug.html"

  echo "  สร้าง $slug.html"
done <<< "$PAGES"

echo ""
echo "เสร็จแล้ว — ประกอบทั้งหมด $count หน้า"
