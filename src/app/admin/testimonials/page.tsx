import type { Metadata } from "next";
import { SideNavBar } from "@/components/admin/SideNavBar";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatWidget } from "@/components/data/StatWidget";
import { getTestimonials } from "@/lib/data/testimonials";
import { getServerTranslation } from "@/i18n/server";
import { TestimonialsManagement } from "./TestimonialsManagement";

export const metadata: Metadata = {
  title: "Testimonials Management — F Studio Admin",
  description: "Moderate client testimonials before they appear publicly.",
};



export default async function AdminTestimonialsPage() {
  const { t } = await getServerTranslation();
  const testimonials = await getTestimonials();
  const pendingCount = testimonials.filter((tItem) => tItem.status === "Pending").length;
  const approvedCount = testimonials.filter((tItem) => tItem.status === "Approved").length;
  const hiddenCount = testimonials.filter((tItem) => tItem.status === "Hidden").length;

  return (
    <div className="flex min-h-dvh">
      <SideNavBar active="testimonials" />
      <div className="flex min-w-0 flex-1 flex-col">
        <AdminHeader
          title={t.admin.testimonials}
          breadcrumbs={[{ label: t.admin.dashboard, href: "/admin/dashboard" }, { label: t.admin.testimonials }]}
        />
        <main role="main" className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <section aria-label={t.testimonialsCMS.moderationMetrics}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatWidget label={t.testimonialsCMS.pending} value={String(pendingCount)} />
              <StatWidget label={t.testimonialsCMS.approved} value={String(approvedCount)} />
              <StatWidget label={t.testimonialsCMS.hidden} value={String(hiddenCount)} />
            </div>
          </section>

          <section aria-label={t.testimonialsCMS.allTestimonials} className="mt-8">
            <TestimonialsManagement testimonials={testimonials} />
          </section>
        </main>
      </div>
    </div>
  );
}
