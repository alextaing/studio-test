import { GetPath, TemplateConfig, TemplateProps } from "@yext/pages";
import Item from "../components/Item";

export const config: TemplateConfig = {
  stream: {
    $id: "studio-stream-id-newLoc",
    localization: { locales: ["en"], primary: false },
    filter: { entityTypes: ["location"] },
    fields: ["name", "slug"],
  },
};
export const getPath: GetPath<TemplateProps> = ({ document }) => {
  return `${document.slug}`;
};

export default function NewLoc({ document }: TemplateProps) {
  return (
    <Item
      name={`${document.name}`}
      image="https://images.unsplash.com/photo-1602143407151-7111542de6e8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=687&q=80"
      price={0}
    />
  );
}
