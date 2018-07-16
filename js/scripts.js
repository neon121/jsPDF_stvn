//you can call first PDFGenerator.preload(); here for loading not user depended files.
PDFGenerator.files.push({path: '_adds/graph1.jpg', type: 'img', img: {w: 180, h: 105}});
PDFGenerator.files.push({path: '_adds/graph2.jpg', type: 'img', img: {w: 180, h: 105}});
PDFGenerator.files.push({path: '_adds/circle1.jpg', type: 'img', img: {w: 49.5, h: 49.5}});
PDFGenerator.files.push({path: '_adds/circle2.jpg', type: 'img', img: {w: 49.5, h: 49.5}});
/*
PDFGenerator.files.push({
    path: '_adds/circle2.jpg',
    dom: document.getElementById('circle2'),
    type: 'img',
    img: {w: 49.5, h: 49.5}
});
 */
PDFGenerator.preload();
var pdf = new PDFGenerator();
pdf.setValues({
    graphs: ['_adds/graph1.jpg', '_adds/graph2.jpg'],
    dates: {
        start: '01-09-2016',
        month: 'May'
    },
    traf: {
        before: 3983,
        after: 7396,
        increased: 3413,
        percents: 85.69,
        lastYear: 391,
        pIncreased: 7005,
        pPercents: 1791.56
    },
    tableData: [
        ['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],
        ['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],
        ['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],
        ['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],
        ['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],
        ['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],
        ['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],
        ['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],['truck camera system', 1,2,3,4,5],
    ],
    conversions: {
        total: 0,
        contacts: 0
    },
    circles: ['_adds/circle1.jpg', '_adds/circle2.jpg']
});
pdf.ready(function () {
    //here ajax loading animation (if you have any) can be hidden
    //pdf.generatePDF('save'); will send file to user's browser for download
    document.getElementById('output').data = pdf.generatePDF('datauristring');
});