import { Component } from '@angular/core';

@Component({
    selector: 'privacy-policy-component',
    template: `
        <section>
            <h2>Privacy Policy</h2>

            <p>Effective Date: 17/09/2025</p>

            <p>This privacy policy describes how Nicolas Gehlert ("I," "me," or "my") manages the privacy of visitors to developapa (the "Blog"). I am committed to protecting your privacy.</p>

            <h3>1. No Collection of Personal Data (Except for Comments):</h3>

            <p>I do not collect any personal data from visitors to this Blog, with the sole exception of the name provided when submitting a comment. I do not use cookies, tracking pixels, or any other technologies to collect information about your browsing activity.</p>

            <h3>2. Comments:</h3>

            <ul>
                <li><b>Information Collected:</b> If you choose to leave a comment on the Blog, you will be asked to provide a name to be displayed alongside your comment.</li>
                <li><b>Alias Names:</b> You are welcome to use an alias or pseudonym for your name when leaving a comment. Providing your real name is not required.</li>
                <li><b>Data Storage:</b> The name you provide and the content of your comment will be stored on the Blog's server. No other personal information is collected or stored in connection with your comments.</li>
                <li><b>Purpose of Collection:</b> The name is collected solely for the purpose of displaying it alongside your comment.</li>
                <li><b>Moderation:</b> I reserve the right to moderate and remove comments that are inappropriate, offensive, or violate the Blog's guidelines.</li>
            </ul>

            <h3>3. Data Sharing:</h3>

            <p>I do not share any personal data with third parties, as I do not collect any personal data beyond the name associated with comments.</p>

            <h3>4. Data Retention:</h3>

            <p>Comments and the associated names will be stored indefinitely unless the comment is removed by me or upon request (see Section 6).</p>

            <h3>5. Data Security:</h3>

            <p>I take reasonable measures to protect the security of the Blog and the data stored on it (including comments and names). However, no method of transmission over the Internet or method of electronic storage is 100% secure.</p>

            <h3>6. Your Rights:</h3>

            <ul>
                <li><b>Access:</b>  You have the right to know what information I hold about you.  In this case, the only information I hold is the name you provided with your comment (if any).</li>
                <li><b>Rectification:</b>  If the name associated with your comment is incorrect, you can request that I correct it.</li>
                <li><b>Erasure:</b> You have the right to request that I delete your comment and the associated name.</li>
                <li><b>To exercise these rights, please contact me at:</b> info&#64;ngehlert.de</li>
            </ul>

            <h3>7. Children's Privacy:</h3>

            <p>This Blog is not directed to children under the age of 16, and I do not knowingly collect personal data from children.</p>

            <h3>8. Changes to this Privacy Policy:</h3>

            <p>I may update this privacy policy from time to time. I will post any changes on this page, and the effective date will be updated accordingly.</p>

            <h3>9. Contact Information:</h3>

            <p>If you have any questions about this privacy policy, please contact me at: info&#64;ngehlert.de</p>
        </section>
    `,
    standalone: true,
    styles: `
        section {
            max-width: var(--content-width);
            margin: 1rem auto;
        }
    `,
})
class PrivacyPolicyComponent {}

export { PrivacyPolicyComponent };
