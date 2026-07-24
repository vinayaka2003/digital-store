import Hero from "@/components/Hero/Hero";
import PreviewGallery from "@/components/PreviewGallery/PreviewGallery";
import Testimonials from "@/components/Testimonials/Testimonials";
import Pricing from "@/components/Pricing/Pricing";

export default function Home() {
  return (
    <>
      <Hero />
      <PreviewGallery />
      <Testimonials />
      <Pricing />
    </>
  );
}