import fs from "node:fs";

// https://github.com/taoqf/node-html-parser
import { parse } from "node-html-parser";

const Info = [];
const Files = ["aceites.html", "chocolate.html", "aguas.html"];

function read_file(file) {
  try {
    return fs.readFileSync(file, "utf8");
  } catch (error) {
    console.error("Error while reading file: ", error);
  }
}

function save_file(file) {
	try {
  	fs.writeFileSync(file, JSON.stringify(Info, null, 2));
  	console.log("File successfully saved.");
	} catch (error) {
	  console.error("Error while saving file: ", error);
	}
}

// Removes new lines, multiple spaces, and trims leading/trailing spaces
function normalize_whitespace(text) {
  let tmp = text.replace("\n", "");
  tmp = tmp.replace(/\s+/g, " ");
  return tmp.trim();
}

function process_file(file) {
	const html = read_file(file);
	const root = parse(html);

	const category = normalize_whitespace(root.querySelector("h1").text);
	const sections = root.querySelectorAll("section.section");

	for (const section of sections) {
		const subcategory = normalize_whitespace(section.querySelector("h2").text);
		const products = section.querySelectorAll("div.product-cell");

		for (const product of products) {
			const img = product.querySelector("img");
			const img_src = img.attrs.src;
			const img_alt = img.attrs.alt;
			const format = product.querySelector("div.product-format");
			const format_text = normalize_whitespace(format.text);
			const price = product.querySelector("div.product-price");
			const price_text = normalize_whitespace(price.text);
			const tmp = price_text.match(/(\d+),?(\d+)?(.+)/);
			const price_number = tmp.length > 2 ? Number(tmp[1] + "." + tmp[2]) : undefined;
			const info_prod = {
			  category,
				subcategory,
			  img_src,
			  img_alt,
			  format_text,
			  price_text,
			  price_number,
			};
			console.log(info_prod);
			Info.push(info_prod);
		}
		save_file("datos_mercadona.json");
	}
}

for (const file of Files) {
	process_file(file);
}

