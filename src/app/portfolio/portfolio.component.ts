import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgOptimizedImage } from '@angular/common';

@Component({
    selector: 'portfolio',
    template: `
        <section>
            Portfolio sounds way to official. This is just a small collection of things
            I tried for fun or to learn something new. Things I did as
            contract work are not listed here, due to NDA or other reasons.

            <article class='limit-content-width-container'>
                <header>
                    <h2>
                        <a [routerLink]="['/boardgame-tracker/main']">Boardgame Tracker</a>
                    </h2>
                </header>
                <p class='post-description'>
                    Once a year, a friend and I organize a boardgame weekend. We meet up in a cabin
                    and play boardgames all weekend long. <br />
                    This project tracks all played games and players. It calculates scores for each individual
                    game and determine the overall winner at the end of the weekend. <br />
                </p>
                <a [routerLink]="['/boardgame-tracker/main']" class="read-more-link">Read More →</a>
            </article>
            <article class='limit-content-width-container'>
                <header>
                    <h2>
                        <a [routerLink]="['/kurve']">Zatacka - Achtung die Kurve</a>
                    </h2>
                </header>
                <p class='post-description'>
                    Remake of the classic DOS game Zatacka ('Achtung, die Kurve!').
                    We played this countless hours in school, so I had to try it myself.<br />
                    Build with native JavaScript and HTML5 Canvas.

                </p>
                <a [routerLink]="['/kurve']" class="read-more-link">Read More →</a>
            </article>

            <article class='limit-content-width-container'>
                <header>
                    <h2>
                        <a href="https://github.com/ngehlert/cobalt2" target="_blank">Cobalt 2 Theme</a>
                    </h2>
                </header>
                <p class='post-description'>
                    Cobalt 2 Theme for Webstorm and for other JetBrains products (like IntelliJ IDEA, PhpStorm, PyCharm, etc.).
                    <br />
                    My theme that I've been using for years now. 70k+ downloads on the JetBrains Marketplace.
                </p>
                <a href="https://github.com/ngehlert/cobalt2" class="read-more-link" target="_blank">Read More →</a>
            </article>

            <article class='limit-content-width-container'>
                <header>
                    <h2>
                        <a href="#">Confin</a>
                    </h2>
                </header>
                <p class='post-description'>
                    One of my first bigger projects, that started in 2014. It was an iOS & Android app to track your daily spendings and budgets. <br />
                    The idea was to have a simple and fast way to log your spendings that works cross platform.<br />
                    In 2022 I personally switched to <a href="https://finanzguru.de/" target="_blank">Finanzguru</a> and stopped adding new updates and eventually pulled it from the Appstore.<br />
                    Build with Ionic versions 1 to 5 and AngularJS to Angular.
                </p>
                <div class="image-preview">
                    <img ngSrc="./assets/portfolio/confin-1.png" alt="Confin app screenshot 1" height="146" width="82" priority/>
                    <img ngSrc="./assets/portfolio/confin-2.png" alt="Confin app screenshot 2" height="146" width="82"/>
                    <img ngSrc="./assets/portfolio/confin-3.png" alt="Confin app screenshot 3" height="146" width="82"/>
                    <img ngSrc="./assets/portfolio/confin-4.png" alt="Confin app screenshot 3" height="146" width="82"/>
                    <img ngSrc="./assets/portfolio/confin-5.png" alt="Confin app screenshot 3" height="146" width="82"/>
                    <img ngSrc="./assets/portfolio/confin-6.png" alt="Confin app screenshot 3" height="146" width="82"/>
                </div>
            </article>

            <article class='limit-content-width-container'>
                <header>
                    <h2>
                        <a href="#">Made my day</a>
                    </h2>
                </header>
                <p class='post-description'>
                    This was a Journal app I mainly built for myself to keep my thoughts and memories. <br />
                    It used a plain Markdown format without any subscription or login. <br />
                    Due to time limitations and AppStore fees I eventually stopped maintaining it after 3 years.<br />
                    Build with Electron and React.
                </p>
                <div class="image-preview">
                    <img ngSrc="./assets/portfolio/made-my-day-1.png" alt="Made my day app screenshot 1" height="150" width="240" priority/>
                    <img ngSrc="./assets/portfolio/made-my-day-2.png" alt="Made my day app screenshot 2" height="150" width="240"/>
                    <img ngSrc="./assets/portfolio/made-my-day-3.png" alt="Made my day app screenshot 3" height="150" width="240"/>
                </div>
            </article>

        </section>
    `,
    styles: `
        :host {
            display: block;
        }

        section {
            max-width: var(--content-width);
            margin: 1rem auto;
        }

        .image-preview {
            display: flex;
            flex-direction: row;
            gap: 1rem;
            flex-wrap: wrap;
        }

    `,
    standalone: true,
    imports: [
        RouterLink,
        NgOptimizedImage,
    ],
})
class PortfolioComponent {
}

export { PortfolioComponent };
