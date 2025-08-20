import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

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
                        <a [routerLink]="['/kurve']">Zatacka - Achtung die Kurve</a>
                    </h2>
                </header>
                <p class='post-description'>
                    Remake of the classic DOS game Zatacka ('Achtung, die Kurve!').
                    We played this countless hours in school, so I had to try it myself.
                </p>
                <a [routerLink]="['/kurve']" class='read-more-link'>Read More →</a>
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

    `,
    standalone: true,
    imports: [
        RouterLink,
    ],
})
class PortfolioComponent {
}

export { PortfolioComponent };
