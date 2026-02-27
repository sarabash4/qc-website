import MainHeader from "@/src/components/MainHeader/MainHeader";
import PortfolioGallery from "@/src/components/PortfolioGallery/PortfolioGallery";

export default function LandingPage() {
  return (
    <main className="w-full">
      {/* Hero: mobile-first padding and spacing */}
      <section
        className="pt-6 pb-10 sm:pt-10 sm:pb-12 md:pt-12 md:pb-16 lg:pt-16 lg:pb-20"
        style={{ paddingLeft: "15px", paddingRight: "15px" }}
      >
        <MainHeader
          title="Nolan Barret is a graphic and interactive designer that works at the intersection of design, technology and culture."
          mode="light"
        />
      </section>

      {/* Portfolio gallery: 15px padding */}
      <section className="bg-white p-[15px] ">
        <PortfolioGallery />
      </section>
    </main>
  );
}
