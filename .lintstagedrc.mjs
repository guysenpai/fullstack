export default {
  '{apps,libs,tools}/**/*.{ts,js,mjs}': ['nx affected -t lint --files --fix'],
  '{apps,libs,tools}/**/*': ['nx format:write --libs-and-apps --files'],
}
