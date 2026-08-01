// Public Layout — route-group wrapper for the 9 public pages (Page_Structure.md PART A).
// Global Components per every public page entry: TopNavBar, Footer.
//
// Phase 9.3.14-A Fix 2 (Public Layout Duplication): this layout originally
// rendered its own placeholder <header>/<main>/<footer> shell (a Foundation-stage
// stub, left unfinished — see the 9.3.14-A audit report §3.1). Every public page
// was, separately, already composing its own real <TopNavBar />, <main role="main">,
// and <Footer /> directly (the established convention across every page in this
// route group — confirmed in Home, About, Brand Identity, Portfolio, Project
// Details, Services, Testimonials, Contact, Client Review, and Review). With both
// layers present, every public page rendered two <header>/<footer> landmarks (one
// empty placeholder, one real) and a <main> nested inside another <main> — invalid
// HTML and a duplicate-landmark accessibility defect, sitewide.
//
// Fix: this layout is now a passthrough. No page needed to change — every one of
// them already renders the correct single TopNavBar/main/Footer shell on its own;
// this route group simply no longer duplicates it above them. One logo instance
// per header, one per footer (UI_Guidelines §18.1) is unaffected: each page still
// renders exactly one <TopNavBar /> and one <Footer />, same as before this fix.

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
