# วิธีใส่วิดีโอจริง

เว็บมีที่ใส่วิดีโอ 3 จุด ทุกจุดตอนนี้ยังเป็นโปสเตอร์ + ข้อความบอกวิธีใส่

---

## จุดที่ 1 — ห้องฉาย (แถวเลื่อนแบบ Netflix) หน้าแรก

เปิด `index.html` หา `<ul class="rail__track">` แต่ละการ์ดมีปุ่มแบบนี้

```html
<button class="tile__link" type="button" data-video="" data-video-title="ชื่อวิดีโอ">
```

### วิธี ก: ใช้ YouTube (แนะนำ — ฟรี ไม่กินแบนด์วิดท์เว็บ)

เอา **ID** จาก URL ยูทูบ ไม่ใช่ URL ทั้งอัน

```
https://www.youtube.com/watch?v=dQw4w9WgXcQ
                                 └──── ID คือส่วนนี้ ────┘
```

ใส่ลงไปแบบนี้

```html
<button class="tile__link" type="button" data-video="dQw4w9WgXcQ" data-video-title="ชื่อวิดีโอ">
```

เสร็จแล้ว กดการ์ดจะเปิดเครื่องเล่นเต็มจอให้เอง
(ใช้โดเมน `youtube-nocookie.com` อยู่แล้ว = ไม่ฝัง cookie ติดตามผู้ใช้ ดีต่อ PDPA)

### วิธี ข: ใช้ไฟล์วิดีโอของตัวเอง

1. เอาไฟล์ `.mp4` ใส่โฟลเดอร์ `Resource/images/video/`
2. แก้เป็น

```html
<button class="tile__link" type="button"
        data-video-file="Resource/images/video/intro.mp4"
        data-video-title="ชื่อวิดีโอ">
```

> ⚠️ ไฟล์วิดีโอควรไม่เกิน **20 MB ต่อไฟล์** ถ้าใหญ่กว่านั้นเว็บจะโหลดช้ามาก
> และ GitHub จำกัดไฟล์ที่ 100 MB — ควรใช้ YouTube แทน

### เปลี่ยนโปสเตอร์
แก้ `src` ของ `<img>` ในการ์ดนั้น ใช้รูป **16:9 ขนาด 1600×900**
วิธีเอาภาพปกจาก YouTube: `https://img.youtube.com/vi/ไอดีวิดีโอ/maxresdefault.jpg`
(ดาวน์โหลดมาเก็บในโฟลเดอร์เราเอง อย่าลิงก์ตรง)

---

## จุดที่ 2 — ปุ่ม "ดูวิดีโอแนะนำ 90 วินาที" ใน Hero

ใน `index.html` หา

```html
<button class="btn btn--outline btn--lg" type="button"
        data-video-open data-video="" data-video-title="แนะนำตัว FiatKopong ใน 90 วินาที">
```

ใส่ YouTube ID ที่ `data-video` เหมือนกัน

---

## จุดที่ 3 — วิดีโอฝังในหน้า About Me

ใน `about-me.html` หา `class="video-frame__play"` แล้วใส่ `data-video` เหมือนกัน

---

## ถ้าอยากให้ Hero เป็นวิดีโอพื้นหลังเคลื่อนไหว

ตอนนี้ฉากหลัง Hero เป็นแสงไล่เฉดที่เคลื่อนไหวด้วย CSS
(เบากว่าวิดีโอมาก และไม่กินเน็ตคนดู) ถ้ายังอยากใช้วิดีโอจริง ทำแบบนี้

เปิด `index.html` หาบล็อกนี้

```html
<div class="hero__backdrop" aria-hidden="true"></div>
```

แทนด้วย

```html
<div class="hero__media" aria-hidden="true">
  <video autoplay muted loop playsinline
         poster="Resource/images/video/poster-intro.svg">
    <source src="Resource/images/video/hero-loop.mp4" type="video/mp4">
  </video>
</div>
```

**ข้อควรระวังเรื่องวิดีโอพื้นหลัง**
- ต้องมี `muted` ไม่งั้นเบราว์เซอร์จะไม่เล่นอัตโนมัติ
- ต้องมี `poster` เผื่อวิดีโอโหลดไม่ทัน/เล่นไม่ได้
- ควรตัดให้สั้น 8–15 วินาที และไม่เกิน 5 MB
- ผู้ใช้ที่ตั้งค่า "ลดการเคลื่อนไหว" ในเครื่อง จะยังเห็นวิดีโอเล่นอยู่ —
  ถ้าจะทำให้ถูกต้องตาม WCAG เต็มที่ ควรเพิ่มปุ่มหยุดเล่น หรือใช้ CSS
  `@media (prefers-reduced-motion: reduce) { .hero__media video { display:none } }`
- อย่าใช้วิดีโอที่มีเสียงเล่นเองเด็ดขาด (ผิด WCAG 1.4.2 และคนกดปิดเว็บทันที)

---

## แหล่งวิดีโอ stock ฟรี (ถ้ายังไม่มีวิดีโอตัวเอง)

| แหล่ง | หมายเหตุ |
|---|---|
| pexels.com/videos | ใช้เชิงพาณิชย์ได้ |
| coverr.co | เน้นวิดีโอพื้นหลังเว็บ |
| pixabay.com/videos | ใช้เชิงพาณิชย์ได้ |

คำค้นที่เข้ากับโทนเว็บ: `city aerial night`, `bangkok traffic timelapse`,
`architecture pan`, `data visualization abstract`

**ห้าม** ดึงวิดีโอจากเว็บข่าว ช่องยูทูบคนอื่น หรือโฆษณาโครงการมาใช้

---

## เรื่องคำบรรยาย (Caption) — จำเป็นตาม WCAG

วิดีโอที่มีเสียงพูด **ต้องมีคำบรรยาย** ถึงจะผ่านเกณฑ์ WCAG 1.2.2 ระดับ A

- YouTube สร้างซับไทยอัตโนมัติได้ แต่ความแม่นยำไม่พอสำหรับตัวเลข
  → ควรเข้าไปแก้ซับเอง โดยเฉพาะจุดที่พูดตัวเลขหรือชื่อทำเล
- วิดีโอที่ใช้ไฟล์เอง ให้เพิ่ม `<track kind="captions" src="..." srclang="th" label="ไทย" default>`
