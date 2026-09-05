import assert from "node:assert/strict";
import { test } from "node:test";
import { exactDatasheetModel, parsePdfImageList, selectProductImage } from "../../../scripts/stack127/lib/pdf-product-images.mjs";

const listing = `
page   num  type   width height color comp bpc  enc interp  object ID x-ppi y-ppi size ratio
--------------------------------------------------------------------------------------------
   1     0 image     700   330  rgb     3   8  jpeg   no        13  0   247   248 16.2K 2.4%
   1     1 image     700   330  rgb     3   8  jpeg   no        14  0   247   248 18.8K 2.8%
   1     2 image     500   500  rgb     3   8  jpeg   no        17  0   212   212 10.9K 1.5%
   1     3 image     100   100  rgb     3   8  jpeg   no        18  0    96    96 1353B 4.5%`;

test("selects the large square product photo over wide brand marks", () => {
  const selected = selectProductImage(parsePdfImageList(listing));
  assert.equal(selected?.number, 2);
  assert.equal(selected?.width, 500);
});

test("ignores a rasterized datasheet page behind the product photo", () => {
  const pageAndProduct = `${listing}\n   1     4 image    1653  2339  rgb     3   8  image  no        19  0   200   200  139K 1.2%`;
  const selected = selectProductImage(parsePdfImageList(pageAndProduct));
  assert.equal(selected?.number, 2);
});

test("accepts only exact model tokens for predictable datasheet URLs", () => {
  assert.equal(exactDatasheetModel("AVR750U"), "AVR750U");
  assert.equal(exactDatasheetModel("(various)"), null);
  assert.equal(exactDatasheetModel("1500 LCD"), null);
});
