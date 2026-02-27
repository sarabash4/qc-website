import MainHeader from "@/src/components/MainHeader/MainHeader";
import PortfolioGallery, {
  type GalleryItem,
} from "@/src/components/PortfolioGallery/PortfolioGallery";

const PLAYGROUND_ITEMS: GalleryItem[] = [
  { id: "playground-image-1", label: "qbicle 1", src: "/images/qbicle/0bb1ab164700707.63fb7be1302e7.jpg" },
  { id: "playground-image-2", label: "qbicle 2", src: "/images/qbicle/caa804164700707.63fb7be1313e9.jpg" },
  { id: "playground-video-1", label: "deftones_story.mp4", src: "/videos/deftones_story.mp4", aspectRatio: 6 / 19 },
  { id: "playground-video-2", label: "parku_story.mp4", src: "/videos/parku_story.mp4", aspectRatio: 6 / 19 },
];

export default function Playground() {
  return (
    <main className="w-full">
      <section
        className="pt-6 pb-10 sm:pt-10 sm:pb-12 md:pt-12 md:pb-16 lg:pt-16 lg:pb-20"
        style={{ paddingLeft: "15px", paddingRight: "15px" }}
      >
        <MainHeader
          title="Nolan Barret is a graphic and interactive designer that works at the intersection of design, technology and culture."
          mode="light"
        />
      </section>

      <section className="bg-white p-[15px]">
        <PortfolioGallery mode="flat" items={PLAYGROUND_ITEMS} />
      </section>
    </main>
  );
}
