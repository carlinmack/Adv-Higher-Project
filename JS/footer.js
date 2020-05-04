class Footer extends HTMLElement {
    connectedCallback() {

        this.shadow = this.attachShadow({
            mode: 'open'
        });

        let firstLine, secondLine;

        if (this.getAttribute('type') === 'blog') {
            firstLine = `<p>
                <a href="/blog/index.xml" type="application/rss+xml" target="_blank">RSS feed</a> |

                Built with <a href="https://gohugo.io">Hugo</a> | Theme is <a href="https://github.com/carlinmack/ezium">Ezium</a>
            </p>`
        } else if (this.getAttribute('type') === 'parachutes') {
            firstLine = `<p> This game was written in pure Javascript</p>`
            secondLine = `<p> 
                    <a rel="license" href="http://creativecommons.org/licenses/by/4.0/"  target="_blank" rel="noreferrer noopener">
                        <img width="16px" height="16px" src="SVG/cc.svg?v=1.04" alt="Creative Commons Licence">
                        <img width="16px" height="16px" src="SVG/by.svg?v=1.04" alt="Creative Commons By"> </a>
                        Carlin MacKenzie & Michael Rimmer 2018-2020</p>`
        } else if (this.getAttribute('type') === 'parachutes') {
            firstLine = `<p> Handwritten in pure CSS and Javascript — <a href="https://www.github.com/carlinmack" target="_blank" rel="noreferrer noopener">Github</a></p>`
        }


        if (typeof (firstLine) === 'undefined')
            firstLine = `<p> Handwritten in pure CSS and Javascript</p>`

        if (typeof (secondLine) === 'undefined')
            secondLine = `<p> 
            <a rel="license" href="http://creativecommons.org/licenses/by/4.0/"  target="_blank" rel="noreferrer noopener">
                <img width="16px" height="16px" src="SVG/cc.svg?v=1.04" alt="Creative Commons Licence">
                <img width="16px" height="16px" src="SVG/by.svg?v=1.04" alt="Creative Commons By"> </a>
            Carlin MacKenzie 2018-2020</p>`


        this.shadow.innerHTML =
            `<style>
            footer {
                display: grid;
                grid-template: "font text nightmode" 1fr / 1fr 4fr 1fr;
                place-items: center;
                text-align: center;
                width: 100vw;
                height: 80px;
                background: var(--background-footer);
                position: relative;
                padding: 10px 0;

                color: #fff;
                font-family: Roboto Mono, Consolas, monospace;
                font-size: 12px;
                font-weight: normal;
                line-height: 2.2;
            }
            div[slot='font'] {
                grid-area: font;
            }
            div[slot='nightmode'] {
                grid-area: nightmode;
            }
            #footerText {
                grid-area: text;
            }
            #footerText p {
                display: contents;
                font-family: Roboto Mono, Consolas, monospace;
                margin: 0;
            }
            #footerText img {
                margin-bottom: -3.5px;
            }
            #footerText a {
                text-decoration: none;
                color: #ccc;
                font-family: Roboto Mono, monospace;
            }
            #footerText a:hover {
                color: var(--color-link-hover);
                transition: color 0.05s ease;
            }
        </style>
        <footer>
            <slot name='font'> </slot>
            <div id='footerText'>
                ${firstLine}<br />${secondLine}
            </div>
            <slot name='nightmode'> </slot>
        </footer>`;
    }
}

window.addEventListener('DOMContentLoaded', () => {
    customElements.define('my-footer', Footer);
});