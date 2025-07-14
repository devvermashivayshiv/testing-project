# Project Rules & Guidelines

## 1. Folder Structure
- Folder structure simple, clean, aur scalable ho.
- Har page ka apna CSS/design folder ho (e.g., `/styles/pages/PageName.css`).
- Badi features (jaise admin panel) ke liye dedicated folder, usme main page + components/features ki files.
- Next.js ke `/api` folder ka use, taki backend/frontend ek jagah se manage ho.
- Saari files/folders sirf `automatic-adsense` ke andar hi add karni hain.
- **Protected pages ab `(protected)` route group me hain (e.g., `src/app/(protected)/dashboard/page.tsx`), jisse URL me `/protected` segment nahi dikhta.**

## 2. UI Design
- UI design simple, minimalistic, light cream ya black theme ho.
- Font: Poppins use ho.

## 3. Project Directory
- Saari development sirf `automatic-adsense` folder me hi hogi.

## 4. Performance & Code Quality
- Code likhne se pehle high-performance, scalable solution sochna hai.
- Industrial-level speed and quality ka dhyan rakhna hai.

## 5. Communication & Workflow
- Har choti cheez ke liye baar-baar puchna nahi.
- Jo add karna ho, ek baar discuss karke turant coding start karni hai, unnecessary delay nahi.

## 6. Protected Routes (NEW)
- Protected pages sirf `(protected)` route group me banayein.
- Inka URL clean hota hai (e.g., `/dashboard`, `/tool`, `/admin-panel`).
- Login check ek hi layout (`(protected)/layout.tsx`) me hota hai, har page me manually kuch nahi likhna padta.
- Header ke links bhi ab clean URLs par point karte hain.

---

*Is file ko hamesha update karte rahen jab bhi koi naya rule ya guideline aaye.* 