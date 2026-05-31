import JsonLdInjector from "./json-ld-client";

type Props = {
  id: string;
  json: unknown;
};

export default function JsonLd({ id, json }: Props) {
  // JSON string safely escaped for embedding
  const html = JSON.stringify(json).replace(/</g, "\\u003c");

  return (
    <>
      {/* Server-rendered inert template containing the JSON-LD */}
      <template id={id} dangerouslySetInnerHTML={{ __html: html }} data-jsonld="true" />
      {/* Client injector will append the actual <script> into the document head */}
      <JsonLdInjector id={id} />
    </>
  );
}
