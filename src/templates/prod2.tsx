import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";
import Banner from "../components/Banner";
import Paragraph from "../components/Paragraph";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-prod2",
    localization: { locales: ["en"], primary: false },
    filter: { entityTypes: ["location"] },
    fields: [],
  },
};
export const getPath: GetPath<TemplateProps> = () => {
  return `product1234`;
};

export default function Prod2() {
  return (
    <>
      <Paragraph value={``} textSize="sm" fontWeight="normal" />
      <Banner />
    </>
  );
}
