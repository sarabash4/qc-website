import MainHeader from "@/src/components/MainHeader/MainHeader";
import PortfolioGallery from "@/src/components/PortfolioGallery/PortfolioGallery";

export default function LandingPage() {
  return (
    <main className="w-full">
      {/* Hero: mobile-first padding and spacing */}
      <section className="px-4 pt-6 pb-10 sm:px-6 sm:pt-10 sm:pb-12 md:px-8 md:pt-12 md:pb-16 lg:px-12 lg:pt-16 lg:pb-20">
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
