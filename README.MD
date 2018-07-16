<h1>jsPDF_stvn</h1>

Generates pdf, all find buds are fixed.
For more info look in js/scripts.js<br/>
All it's content can be in button click handler<br/>

<h2>How it works</h2>

pdf.setValues - function for setting values.<br/>
Script uses external files, which must be loaded before it can
work. Calling PDFGenerator.preload() allows to start preloading
before user asked to do it. You can call it more than once, only
not loaded files will be loaded. For example, it is possible to 
preload fonts and logos, and wait until graphs are ready in HTML<br/>
After you added all necessary images to PDFGenerator.files you should use
pdf.ready(func()) - func() will be loaded only after all preloadings are finished

<h2>Example of loading from HTML</h2>
If you need to add a picture (chart for example) from
existing HTML, there is an example
<pre>
PDFGenerator.files.push({
    path: '_adds/circle2.jpg', //still needed, it is an identificator
    dom: document.getElementById('circle2'),
    type: 'img',
    img: {w: 49.5, h: 49.5} //you have to determine it by yourself
});
</pre>

path value must be equal to appropriate value in pdf.setValues();  