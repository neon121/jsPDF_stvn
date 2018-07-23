class PDFGenerator {
    constructor() {
        this.doc = new jsPDF('p', 'mm', 'a4');
        PDFGenerator.preload().then(() => {
            for (let file of PDFGenerator.files) {
                switch (file.type) {
                    case 'font':
                        this.doc.addFileToVFS(file.path, btoa(file.loaded));
                        this.doc.addFont(file.path, file.font.name, file.font.type);
                        break;
                    default:
                        break;
                }
            }
            this.ready = true;
        });
    }
    
    static preload() {
        let arr = [];
        for (let i in PDFGenerator.files) {
            if (!PDFGenerator.files.hasOwnProperty(i)) continue;
            let file = PDFGenerator.files[i];
            if (!file.loaded) {
                if (file.dom === undefined) arr.push(PDFGenerator._ajax(i));
                else arr.push(PDFGenerator._fromHTML(i))
            }
            else arr.push(new Promise(resolve => {resolve(true)}));
        }
        PDFGenerator.preloaded = Promise.all(arr).then(
            () => {},
            error => PDFGenerator._ajaxErrorHandler(error)
        );
        return PDFGenerator.preloaded;
    }
    
    ready(func) {
        PDFGenerator.preload().then(() => {
            return new Promise((resolve) => {
                let int = setInterval(() => {
                    if (this.ready) {
                        clearInterval(int);
                        resolve(true);
                    }
                }, 10);
            });
        }).then(func);
    }
    
    static _fromHTML(i) {
        return new Promise((resolve, reject) => {
            let file = PDFGenerator.files[i];
            html2canvas(file.dom).then(canvas => {
                canvas.toBlob(blob => {
                    let reader = new FileReader();
                    reader.addEventListener('loadend', e => {
                        file.loaded = e;
                        resolve(true);
                    });
                    reader.readAsText(blob)
                });
            });
        });
    }
    
    static _ajax(i) {
        return new Promise((resolve, reject) => {
            let file = PDFGenerator.files[i];
            if (file.pending === undefined) file.pending = true;
            else {
                let int = setInterval(() => {
                    if (file.loaded !== undefined && file.loaded !== false ) {
                        clearInterval(int);
                        resolve(true);
                    }
                }, 50);
            }
            let xhr = new XMLHttpRequest();
            xhr.responseType = 'arraybuffer';
            let fname = 'misc/' + file.path;
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if(xhr.status === 200) {
                        var byteArray = new Uint8Array(xhr.response);
                        let loaded = '';
                        for (let j = 0; j < byteArray.byteLength; j++) {
                            loaded += String.fromCharCode(byteArray[j]);
                        }
                        PDFGenerator.files[i].loaded = loaded;
                        resolve(true);
                    }
                    else {
                        reject(fname + ' http status:' + xhr.status);
                    }
                }
            };
            xhr.addEventListener("error", () => reject(xhr));
            xhr.open('GET', fname, true);
            xhr.send()
        });
        
    }
    
    static _ajaxErrorHandler(error) {
        console.error('AJAX error: ' + error);
        return false;
    }
    
    setValues(arr) {
        this.v = arr;
    }
    
    /**
     *
     * @param type type of return. Can be: save (will send file to download), datauristring
     * @param name if type == save, will be name of downloaded file
     * @returns {jsPDF}
     */
    generatePDF(type, name) {
        if (typeof type === 'undefined') type = 'save';
        this.addPage(true);
        this.h1('Organic Traffic*');
        this.addImage(this.v.graphs[0], 15, 84);
        this.splitedText(
            'Your Search Engine Optimisation campaign started on '+this.v.dates.start+'. Your monthly organic traffic ' +
            'at the start of the campaign was '+this.v.traf.after+'. Your '+this.v.dates.month+
            ' organic traffic was '+this.v.traf.before+'. Since the campaign ' +
            'started your organic traffic has increased by '+this.v.traf.increased+' ('+this.v.traf.percents+'%).'
        );
        this.reference('*Organic traffic');
        this.referenceText(
            'This is the total amount of times people have come ' +
            'to your website from search engines (e.g. Google).');
        this.bottomLine();
        this.addPage();
        this.h1(['Year on Year', 'Traffic Performance*']);
        this.addImage(this.v.graphs[1], 15, 84);
        this.splitedText(
            this.v.dates.month+'’s organic traffic was '+this.v.traf.after+'. ' +
            'Last year, during the same period, your organic traffic was '+this.v.traf.lastYear+'. ' +
            'Since last year, your organic traffic for this ' +
            'period has increased by '+this.v.traf.pIncreased+' ('+this.v.traf.pPercents+'%)');
        this.reference('*Year on Year Traffic Performance');
        this.referenceText(
            'This is the total amount of organic traffic for the current ' +
            'period compared against the same period last year ' +
            '(updated live).');
        this.bottomLine();
        this.addPage();
        this.h1('Keywords');
        this.splitedText(
            'This section shows your real-time keyword rankings on Google.co.uk, updated once a day at 8am.' +
            'We consider anything below page 10 of Google of little to no value. Therefore, if a keyword' +
            'is ranking below page10 a ‘-’ will be shown.', 90);
        this.doc.setFont('Futura PT', 'Demi').setFontSize(13.79).setTextColor('#1a2b3d');
        this.doc.text(15, 115, 'Understanding the columns:');
        this.doc.text(15, 127, 'Start:');
        this.doc.text(15, 133, 'Google:');
        this.doc.text(15, 139, '30 days:');
        this.doc.text(15, 145, 'Life:');
        this.doc.text(15, 151, 'Comp:');
        this.doc.setFont('Futura PT', 'Book');
        this.doc.text(27, 127, 'Your exact keyword position at the start of the campaign');
        this.doc.text(33, 133, 'Your current real-time position on Google');
        this.doc.text(34, 139, 'Your keyword movements over the last 30 days');
        this.doc.text(25, 145, 'Your keyword movements since the campaign started (campaign lifetime)');
        this.doc.text(30, 151, 'Number of results showing up on Google when searching for your keyword');
        
        let columns = ['Keyword', 'Start', 'Rank', '30 Days', 'Life', 'Comp'];
        let data = this.v.tableData;
        let h = 165;
        let i = 0;
        this.drawRow(columns, h, i % 2 === 0, true);
        i++;
        h += 8;
        for (let row of data) {
            this.drawRow(row, h, i % 2 === 0);
            h += 8;
            i++;
            if (h > 240) {
                this.addPage();
                this.h1('Keywords');
                i = 0;
                h = 90;
            }
        }
        this.bottomLine();
        this.addPage();
        this.h1('Conversions');
        this.columnH2(['Total', 'Conversions'], 56, 90);
        this.circle(0, this.v.conversions.total, 32, 110);
        this.columnText(
            'This is the total number of conversions on your website. ' +
            'A conversion is one of the most important factors in the ' +
            'success of your online marketing strategy - it means ' +
            'getting your website visitors to do what you want them ' +
            'to do. For example, filling in your website contact form, ' +
            'clicking on your phone icon through their mobile device ' +
            'or clicking on the ‘checkout’ button of your store.', 56, 178);
        this.bottomLine();
        this.columnH2(['Total Contact', 'Page Visits'], 150, 90);
        this.circle(1, this.v.conversions.contacts, 125, 110);
        this.columnText(
            'This is the total number of visits you’ve had to your contact page. ' +
            'Not everyone who visits this page will convert, and sometimes they ' +
            'will reach out to you in a way we cannot track, e.g. by phone. For ' +
            'this reason the number will always be higher than conversions. ' +
            'However, it is an excellent gauge of how successful your campaign ' +
            'is in engaging your audience and getting them interested in you, ' +
            'your brand, and what you ultimately want them to do.', 150, 178);
        this.reference('*Please note');
        this.referenceText(
            'Please note that we are unable to track visitors who may visit ' +
            'you in person or call you by manually typing in your phone number.');
        this.addPage();
        this.h1(['Monthly Campaign', 'Overview']);
        this.h2('On-Boarding', 15, 102);
        this.splitedText('In the first month we research the keywords which we will target for the campaign. We also \n' +
            'set up the CMS Dashboard and both the campaign and keyword performance reporting.\n' +
            '\n' +
            'We also perform a competitor analysis to see what Google is preferring to rank for each of your keywords. ' +
            'We examine the use of links, brand mentions, semantic LSI phrases social media and online profiles, until ' +
            'we have a clear picture of what is working well for the competition.\n' +
            '\n' +
            'Finally we perform the technical audit where we examine over 180 different points that can affect your ' +
            'site health. This includes 404 errors, 301, 302 and canonicalisation issues, XML sitemaps and issues ' +
            'with the robots.txt file.\n\n' +
            '\n' +
            'All the above informs the strategy from which we develop an action plan.', 135);
        this.bottomLine();
        /*-----------EXAMPLE OF NEW FUNCTION USAGE IS HERE-------------------*/
        this.addPage();
        let block = document.getElementById('textExample');
        this.h1(block.getElementsByTagName('h1')[0].innerText);
        let txt = block.getElementsByTagName('div')[0].innerHTML
            .replace(/\r|\n|\t/g,'')
            .replace(/\s+/g,' ')
            .replace(/^\s|\s$/g,'');
        this.splitedText(txt, 80);
        this.bottomLine();
        /*-------------------------------------------------------------------*/
        return this.doc.output(type, name);
    }
    
    h2(str, x, y) {
        this.doc.setFont('Futura PT', 'Bold').setFontSize(24).setTextColor('#1a2b3d');
        this.doc.text(str, x,y);
    }
    
    columnText(str, x, y) {
        let split = this.splitText(str, 14, 80);
        this.doc.setFont('Futura PT', 'Book').setFontSize(14).setTextColor('#1a2b3d');
        this.doc.text(split, x, y, 'center');
    }
    
    circle(num, value, x, y) {
        this.addImage(this.v.circles[num], x,y);
        this.doc.setTextColor('#0083a0').setFontSize(48).setFont('Futura PT', 'Demi')
            .text(value.toString(), x + 24, y + 31, 'center')
    }
    
    columnH2(text, x, y) {
        this.doc.setFont('Futura PT', 'Bold').setFontSize(24).setTextColor('#1a2b3d').text(text, x, y, 'center');
    }
    
    drawRow(columns, h, odd, isHeader) {
        if (odd) this.doc.setFillColor('#a1cffc');
        else this.doc.setFillColor('#f5f5f5');
        this.doc.rect(15, h, 180, 8, 'F');
        if (isHeader) this.doc.setTextColor('#ffffff').setFont('Futura PT', 'Bold');
        else this.doc.setTextColor('#505050').setFont('Futura PT', 'Book');
        this.doc.setFontSize(10);
        let lefts = [17, 105, 122, 140, 165, 179];
        for (let i in columns) {
            if (!columns.hasOwnProperty(i)) continue;
            let val = columns[i];
            this.doc.text(lefts[i], h + 5, val.toString());
        }
    }
    
    splitText(str, size, width) {
        if (width === undefined) width = 180;
        pdf.doc.setFont('helvetica','').setFontSize(size);
        return this.doc.splitTextToSize(str, width);
    }
    
    addPage(onlyTemplate) {
        if (!onlyTemplate) this.doc.addPage();
        this.drawTemplate();
    }
    
    referenceText(str) {
        let split = this.splitText(str, 12);
        this.doc.setFont('Futura PT', 'Book').setFontSize(12).setTextColor('#1a2b3d');
        this.doc.text(15, 275, split);
    }
    
    reference(str) {
        let split = this.splitText(str, 12);
        this.doc.setFont('Futura PT', 'Demi').setFontSize(12).setTextColor('#1a2b3d');
        this.doc.text(12, 268, split);
    }
    
    splitedText(S, y) {
        S = S.replace(/\r|\n|\t/g,'')
            .replace(/\s+/g,' ')
            .replace(/^\s|\s$/g,'');
        if (y === undefined) y = 217;
        let xMin = 15;
        let xMax = 180;
        let x = xMin;
        let yStep = 5;
        let fontSize = 13.39;
        S = S.replace(/<br\/?>/, '<br/>');
        S = S.split(/(<.+?>)/);
        this.doc.setFont('Futura PT', 'Book').setFontSize(fontSize).setTextColor('#1a2b3d');
        this.doc.setDrawColor('#1a2b3d');
        let fontStyle = {italic: false, bold: false, underline: false, h3: false};
        for (let str of S) {
            switch(str) {
                case '<i>':  fontStyle.italic    = true;  break;
                case '<b>':  fontStyle.bold      = true;  break;
                case '<u>':  fontStyle.underline = true;  break;
                case '<h3>': fontStyle.h3        = true; break;
                case '</i>': fontStyle.italic    = false; break;
                case '</b>': fontStyle.bold      = false; break;
                case '</u>': fontStyle.underline = false; break;
                case '</h3>': fontStyle.h3        = false; break;
                case '<br/>':
                    x = xMin;
                    y += yStep;
                    break;
                default:
                    if (x === xMin) str = str.replace(/^\s+/,'');
                    if (str === '') continue;
                    let ftStr = fontStyle.bold ? 'Bold' : 'Book';
                    if (fontStyle.italic) ftStr += ' Italic';
                    this.doc.setFont('Futura PT', ftStr);
                    if (fontStyle.h3) {
                        x = xMin;
                        y += yStep + 25;
                        this.doc.setFont('Futura PT', 'Bold').setFontSize(24);
                        this.doc.text(str, x, y);
                        y += yStep + 25;
                    }
                    else {
                        this.doc.setFontSize(fontSize);
                        let xStep, xNew;
                        while (str.length > 0) {
                            let subStr = "";
                            do {
                                let word = /\s?[^\s]+/.exec(str);
                                if (word == null) word = /\s+/.exec(str)[0];
                                else word = word[0];
                                xStep = this.doc.getStringUnitWidth(subStr+word) * fontSize * 25.6 / 72;
                                xNew = x + xStep;
                                if (x + xStep > xNew) break;
                                else {
                                    subStr += word;
                                    str = str.substr(word.length);
                                }
                                if (str.length === 0) break;
                            } while (xNew < xMax);
                            if (x === xMin) subStr = subStr.replace(/^\s+/,'');
                            this.doc.text(subStr, x, y);
                            if (fontStyle.underline) {
                                this.doc.line(
                                    x, y + 0.5,
                                    x + this.doc.getStringUnitWidth(subStr) * fontSize * 25.6 / 72, y + 0.5
                                );
                            }
                            x = xMin;
                            if (str.length > 0) y += yStep;
                        }
                        x = xNew;
                    }
                    break;
            }
        }
    }
    
    bottomLine() {
        this.doc.setFillColor('#808285');
        this.doc.rect(15, 257, 180, 0.3, 'F');
    }
    
    h1(text) {
        if (typeof text == 'string') {
            text = this.splitText(text, 36, 120);
            if (text.length == 1) text = text[0];
        }
        this.doc.setFont('Futura PT', 'Bold').setTextColor('#0083a0').setFontSize(36);
        if (typeof text == 'object') this.doc.text(text, 14.3, 53);
        else this.doc.text(text, 14.3, 60);
    }
    
    drawTemplate() {
        this.addImage('logo/1.png', 15.0,14.096);
        this.addImage('logo/2.png', 35.853,13.811);
        this.addImage('logo/3.png', 52.494,14.135);
        this.doc.setFont('Futura PT', 'Bold').setTextColor('#1a2b3d').setFontSize(10);
        this.alignRight("Bridge Electronics", 195, 17);
        this.doc.setTextColor('#cadcea');
        this.alignRight("SEO Report May 2018", 195, 20.8);
        this.doc.setFillColor('#808285').rect(15, 29, 180, 0.3, 'F');
        this.doc.setFillColor('#1a2b3d');
        this.doc.rect(0, 40, 6.3, 33, 'F');
        this.doc.setFillColor('#0083a0');
        this.doc.rect(210-6.2, 217, 6.2, 12, 'F');
    }
    
    alignRight(text, x, y) {
        let w = this.doc.getStringUnitWidth(text) / (72/25.6) * 10;
        this.doc.text(x - w, y, text);
    }
    
    addImage(path, x, y) {
        for (let file of PDFGenerator.files) {
            if (file.path == path) {
                this.doc.addImage(
                    'data:image/png;base64,' + btoa(file.loaded),
                    x,y,
                    file.img.w, file.img.h
                );
                return;
            }
        }
        console.error(path + ' img not found');
    }
}
PDFGenerator.files = [
    {path: 'FuturaPT-Bold.ttf', type: 'font', loaded: false, font: {name: 'Futura PT', type: 'Bold'}},
    {path: 'FuturaPT-Book.ttf', type: 'font', loaded: false, font: {name: 'Futura PT', type: 'Book'}},
    {path: 'FuturaPT-Demi.ttf', type: 'font', loaded: false, font: {name: 'Futura PT', type: 'Demi'}},
    //{path: 'FuturaPT-Bold-Italic.ttf', type: 'font', loaded: false, font: {name: 'Futura PT', type: 'Bold Italic'}},
    //{path: 'FuturaPT-Book-Italic.ttf', type: 'font', loaded: false, font: {name: 'Futura PT', type: 'Book Italic'}},
    //{path: 'FuturaPT-Demi-Italic.ttf', type: 'font', loaded: false, font: {name: 'Futura PT', type: 'Demi Italic'}},
    {path: 'logo/1.png', type: 'img', loaded: false, img: {w: 16.939, h: 6.191}},
    {path: 'logo/2.png', type: 'img', loaded: false, img: {w: 12.053, h: 6.836}},
    {path: 'logo/3.png', type: 'img', loaded: false, img: {w: 22.317, h: 7.097}}
];