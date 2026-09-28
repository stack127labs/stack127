export function hardwareCardName(name: string, vendor: string, model: string) {
  if (/^0x[0-9a-f]+$/i.test(model)) return name;
  if (!model || /certified variants|^\(various\)$|not published|unknown/i.test(model)) return name;
  return model.toLowerCase().startsWith(vendor.toLowerCase()) ? model : `${vendor} ${model}`;
}
