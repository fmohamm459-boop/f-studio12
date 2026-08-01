import type { Metadata } from "next";
import { SideNavBar } from "@/components/admin/SideNavBar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatWidget } from "@/components/data/StatWidget";
import { getTestimonials } from "@/lib/data/testimonials";
import { TestimonialsManagement } from "./TestimonialsManagement";

export const metadata: Metadata = {
  title: "Testimonials Management — F Studio Admin",
  description: "Moderate client testimonials before they appear publicly.",
};

// Reads live Testimonial rows on every request (Phase 9.3.9, Database
// Integration) rather than the static TESTIMONIALS mock array.
export const dynamic = "force-dynamic";

/**
 * Testimonials Management (Page_Structure.md §15). Global Components:
 * SideNavBar, AdminHeader. Moderation Metrics render here; the Moderation
 * Table + Review Panel drawer live in TestimonialsManagement (colocated
 * client component).
 */
export default async function AdminTestimonialsPage() {
  const testimonials = await getTestimonials();
  const pendingCount = testimonials.filter((t) => t.status === "Pending").length;
  const approvedCount = testimonials.filter((t) => t.status === "Approved").length;
  const hiddenCount = testimonials.filter((t) => t.status === "Hidden").length;

  return (
    <div className="flex min-h-dvh">
      <SideNavBar active="testimonials" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader title="Testimonials" breadcrumbs={[{ label: "Admin" }, { label: "Testimonials" }]} />
        <main role="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <section aria-label="Moderation metrics">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatWidget label="Pending" value={String(pendingCount)} />
              <StatWidget label="Approved" value={String(approvedCount)} />
              <StatWidget label="Hidden" value={String(hiddenCount)} />
            </div>
          </section>

          <section aria-label="All testimonials" className="mt-8">
            <TestimonialsManagement testimonials={testimonials} />
          </section>
        </main>
      </div>
    </div>
  );
}
