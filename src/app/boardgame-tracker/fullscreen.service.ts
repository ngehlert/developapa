import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class FullscreenService {
    public isFullscreen = signal(false);

    public toggle(): void {
        this.isFullscreen.update(value => !value);
    }
}
