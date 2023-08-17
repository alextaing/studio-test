import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";
import Banner from "../components/Banner";
import BigButton from "../components/BigButton";
import Card from "../components/Card";
import Footer from "../components/Footer";
import Paragraph from "../components/Paragraph";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-MyLocationPage",
    localization: { locales: ["en"], primary: false },
    filter: { entityTypes: ["location"] },
    fields: ["name", "address", "isoRegionCode"],
  },
};
export const getPath: GetPath<TemplateProps> = ({
  document,
}: TemplateProps) => {
  return `${document.name}`;
};
export default function MyLocationPage({ document }: TemplateProps) {
  return (
    <>
      <Banner />
      <Card title={`${document.name}`} url={`${document.address.city}`} />
      <BigButton title={`Button Title ${document.name}`} href="#" />
      <Paragraph
        value={`Paragraph ${document.address.city} ${document.isoRegionCode} ${document.locale} ${document.key}`}
        textSize="base"
        fontWeight="normal"
      />
      <Footer />
    </>
  );
}
