// Public Layout — route-group wrapper for the 9 public pages (Page_Structure.md PART A).
// Global Components per every public page entry: TopNavBar, Footer.
//
// Phase 93.14-A Fix 2 (Public Layout Duplicati// rendered its own placeholder <header>/<main>/<d Identity, Portfolio, Project
// Details, Services, Testimonials, Contact, Client Review, and Review). With bo
// layers present, every public page rendernvalid
// HTML and a duplicate-landmark accessibility defect, sitewide.
//
// Fix: this layout is now a passthrough. No page needed to change — every one of
// them already renders the correct single TopNavBar/main/Footer shell on its own;
// this route group simply no longer duplicates it above them. One logo instance
// per header, one per footer (UI_Guidelines §18.1) is unaffected: each page still
// renders 

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}