import { ChangeDetectionStrategy, Component } from '@angular/core';import { MatDialogActions, MatDialogClose, MatDialogContent } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';

@Component({
    selector: 'rules-dialog',
    template: `
        <mat-dialog-content>
            <h2>Rules</h2>
            <h4>Fairness & respect</h4>
            <p>
                All games should be played fair. Be respectful to each other and play games according to the rules.
                Avoid playing house rules and stick to the official rules. <br />
                The winner will add the points for everyone who played the game. The others will clean up the game in
                the meantime.
            </p>
            <h4>Point calculation</h4>
            <p>
                Each game has a defined expected duration. This may be a fixed duration on the packaging like 30
                minutes, but could also be a range like 30-45 minutes. In this case the lower value should be used.
                Games that have no explicit duration on the packaging get a value assigned by the organizer - usually
                based on experience. <br />
                The 1st place of a game receives the duration multiplied by the number of players as points. E.g. if 4
                players play a game with the expected duration of 30 minutes, the winner receives 120 points (30 * 4).
                The 2nd place receives duration multiplied by number of players minus one (30 * 3 = 90 points), the 3rd
                place 60 points (30 * 2) and so on. <br />
                If two players share a place they receive the average of the points for the places they occupy. E.g. if
                two players share the 2nd place in the above mentioned 4 player game, they receive (90 + 60) / 2 = 75
                points each.
                <br />
            </p>
            <h4>Co-op games</h4>
            <p>
                Some games are played as a team, e.g. code names where you play as two teams but each team consists of
                multiple persons. In those cases the above calculation works the same, but instead of taking the "player
                count" the "team count" is used. So it doesn't matter if the team consists of 2 or 5 persons, the team
                still counts as one. If the game has a duration of 45 minutes and is played by two teams, the winning
                team will receive 90 points (45 * 2) and the other team 45 points (45 * 1).
                <br />
                In cases where you play as a team against the game itself, e.g. pandemic, you treat it as a two team
                game which means if you win you will receive twice the duration as points and if you lose you will
                receive the duration as points.
            </p>
            <h4>Special games</h4>
            <p>
                Some games are highlighted in the list with a special color. Those count for a separate winning
                category. The first game you play each game will count towards the separate winning category.<br />
                Each additional game you play will reward points for your total points but will not <b>NOT</b> update
                your points in the special category.
            </p>
            <h4>This application</h4>
            <p>
                While this sounds like a lot of math, gladly you don't need to worry about any of this. All of this will
                be calculated automatically. You just need to enter the placements after each game and the application
                will do the rest.
            </p>
        </mat-dialog-content>
        <mat-dialog-actions align="end">
            <button
                mat-button
                mat-dialog-close
            >
                Close
            </button>
        </mat-dialog-actions>
    `,
    imports: [MatDialogContent, MatDialogActions, MatButton, MatDialogClose],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RulesDialogComponent {}
