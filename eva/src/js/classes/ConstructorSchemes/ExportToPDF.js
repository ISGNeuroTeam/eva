import {
  GraphComponent, Insets, Size, SvgExport,
} from 'yfiles';
import { jsPDF as JsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

const PaperSize = {
  A3: 'A3',
  A4: 'A4',
  A5: 'A5',
  A6: 'A6',
  LETTER: 'Letter',
  AUTO: 'Auto',
};

export class ExporterToPDF {
  sourceGraphComponent = null

  scale = 1

  margins = Insets.from(10)

  paperSize = PaperSize.AUTO

  exportRect = undefined

  background = '#ffffff'

  constructor(sourceGraphComponent, options) {
    this.sourceGraphComponent = sourceGraphComponent;
    this.setOptions(options);
  }

  setOptions(options) {
    this.scale = options?.scale ?? 1;
    this.margins = options?.margins ? Insets.from(options?.margins) : Insets.from(10);
    this.paperSize = options?.paperSize ? PaperSize[options?.paperSize] : PaperSize.AUTO;
    this.exportRect = options?.exportRect ?? undefined;
    this.fileName = options?.fileName || 'schema';
    this.background = options?.background || this.background;
  }

  async getSVGElement() {
    // Create a new graph component for exporting the original SVG content
    const exportComponent = new GraphComponent();
    // ... and assign it the same graph.
    exportComponent.graph = this.sourceGraphComponent.graph;
    exportComponent.updateContentRect();

    // Determine the bounds of the exported area
    const targetRect = this.exportRect || exportComponent.contentRect;
    // Create the exporter class
    const exporter = new SvgExport({
      worldBounds: targetRect,
      scale: this.scale,
      margins: this.margins,
      encodeImagesBase64: true,
      inlineSvgImages: true,
      ensureUniqueIds: true,
    });

    // set cssStyleSheets to null so the SvgExport will automatically collect all style sheets
    exporter.cssStyleSheet = null;

    // export the component to svg
    const svgElement = await exporter.exportSvgAsync(exportComponent);
    const size = this.getExportSize(exporter);
    return { svgElement, size };
  }

  async exportPdfClientSide() {
    const { svgElement, size } = await this.getSVGElement();

    await this.convertSvgToPdf(svgElement, size);
  }

  async convertSvgToPdf(svgElement, size) {
    svgElement = svgElement.cloneNode(true);

    const sizeArray = [size.width + 20, size.height + 20];

    const container = document.createElement('div');
    container.style.width = `${sizeArray[0]}px`;
    container.style.height = `${sizeArray[1]}px`;

    container.appendChild(svgElement);

    // Добавление элемента в DOM
    document.body.appendChild(container);

    await html2canvas(container, {
      width: size.width + 20,
      height: size.height + 20,
      backgroundColor: this.background,
      logging: false,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        // Создаем новый объект jsPDF
        const pdf = new JsPDF({
          orientation: sizeArray[0] > sizeArray[1] ? 'l' : 'p',
          unit: 'px',
          format: sizeArray,
          putOnlyUsedFonts: true,
        });
        pdf.addImage(imgData, 'PNG', 0, 0, sizeArray[0], sizeArray[1]);
        document.body.removeChild(container);
        // Сохраняем PDF
        pdf.save(`${this.fileName}.pdf`);
      });
  }

  getExportSize(exporter) {
    switch (this.paperSize) {
      case PaperSize.A3:
        return new Size(842, 1191);
      case PaperSize.A4:
        return new Size(595, 842);
      case PaperSize.A5:
        return new Size(420, 595);
      case PaperSize.A6:
        return new Size(298, 420);
      case PaperSize.LETTER:
        return new Size(612, 792);
      default:
        return new Size(exporter.viewWidth, exporter.viewHeight);
    }
  }
}

export const convertSvgToPdf = async (svgElement, size) => {
  svgElement = svgElement.cloneNode(true);

  const sizeArray = [size.width, size.height];

  const container = document.createElement('div');
  container.style.width = `${sizeArray[0]}px`;
  container.style.height = `${sizeArray[1]}px`;

  container.appendChild(svgElement);

  // Добавление элемента в DOM
  document.body.appendChild(container);

  await html2canvas(container, { ...size })
    .then((canvas) => {
      const imgData = canvas.toDataURL('image/png');

      // Создаем новый объект jsPDF
      // eslint-disable-next-line new-cap
      const pdf = new JsPDF({
        orientation: sizeArray[0] > sizeArray[1] ? 'l' : 'p',
        unit: 'px',
        format: sizeArray,
        compress: true,
      });
      pdf.addImage(imgData, 'PNG', 0, 0, sizeArray[0], sizeArray[1]);
      document.body.removeChild(container);
      // Сохраняем PDF
      pdf.save('your-filename.pdf');
    });
};
//
// export const exportPdfClientSide = async (
//   graphComponent,
//   scale = 1,
//   margins = Insets.from(10),
//   paperSize = PaperSize.AUTO,
//   exportRect = undefined,
// ) => {
//   // Create a new graph component for exporting the original SVG content
//   const exportComponent = new GraphComponent();
//   // ... and assign it the same graph.
//   exportComponent.graph = graphComponent.graph;
//   exportComponent.updateContentRect();
//
//   // Determine the bounds of the exported area
//   const targetRect = exportRect || exportComponent.contentRect;
//
//   // Create the exporter class
//   const exporter = new SvgExport({
//     worldBounds: targetRect,
//     scale,
//     margins,
//     encodeImagesBase64: true,
//     inlineSvgImages: true,
//     ensureUniqueIds: true,
//   });
//
//   // set cssStyleSheets to null so the SvgExport will automatically collect all style sheets
//   exporter.cssStyleSheet = null;
//
//   // export the component to svg
//   const svgElement = await exporter.exportSvgAsync(exportComponent);
//
//   const size = getExportSize(paperSize, exporter);
//   await convertSvgToPdf(svgElement, size);
// };
