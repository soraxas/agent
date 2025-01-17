import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { faArrowsAlt, faArrowsAltV, faHandPaper, faHandRock, faMousePointer } from '@fortawesome/free-solid-svg-icons';

import {
    MacroMouseSubAction,
    MouseButtons,
    MouseButtonMacroAction,
    MoveMouseMacroAction,
    ScrollMouseMacroAction
} from 'uhk-common';
import { MacroBaseComponent } from '../macro-base.component';

type MouseMacroAction = MouseButtonMacroAction | MoveMouseMacroAction | ScrollMouseMacroAction;

enum TabName {
    Move,
    Scroll,
    Click,
    Hold,
    Release
}

@Component({
    selector: 'macro-mouse-tab',
    templateUrl: './macro-mouse.component.html',
    styleUrls: [
        '../../macro-action-editor.component.scss',
        './macro-mouse.component.scss'
    ],
    host: {'class': 'macro__mouse'}
})
export class MacroMouseTabComponent extends MacroBaseComponent implements OnInit, OnChanges {
    @Input() macroAction: MouseMacroAction;

    /* tslint:disable:variable-name: It is an enum type. So it can start with uppercase. */
    MouseButtons = MouseButtons;
    TabName = TabName;
    /* tslint:enable:variable-name */
    activeTab: TabName;
    buttonLabels: string[];
    faArrowsAlt = faArrowsAlt;
    faArrowsAltV = faArrowsAltV;
    faHandPaper = faHandPaper;
    faHandRock = faHandRock;
    faMousePointer = faMousePointer;
    private selectedButtons: boolean[];

    constructor() {
        super();
        this.buttonLabels = ['Left', 'Middle', 'Right'];
        this.selectedButtons = Array(this.buttonLabels.length).fill(false);
    }

    ngOnInit() {
        if (!this.macroAction) {
            this.macroAction = new MouseButtonMacroAction();
            this.macroAction.action = MacroMouseSubAction.click;
        }
        const tabName = this.getTabName(this.macroAction);
        this.selectTab(tabName);
        const buttonActions = [TabName.Click, TabName.Hold, TabName.Release];
        if (buttonActions.includes(this.activeTab)) {
            this.selectedButtons = (<MouseButtonMacroAction>this.macroAction).getMouseButtons();
        }
    }

    ngOnChanges() {
        this.ngOnInit();
    }

    selectTab(tab: TabName): void {
        this.activeTab = tab;

        if (tab === this.getTabName(this.macroAction)) {
            return;
        } else {
            this.selectedButtons = [];
        }

        switch (tab) {
            case TabName.Scroll:
                this.macroAction = new ScrollMouseMacroAction();
                break;
            case TabName.Move:
                this.macroAction = new MoveMouseMacroAction();
                break;
            default:
                this.macroAction = new MouseButtonMacroAction();
                this.macroAction.action = this.getAction(tab);
                break;
        }
        this.validate();
    }

    setMouseClick(index: number): void {
        this.selectedButtons[index] = !this.selectedButtons[index];
        (<MouseButtonMacroAction>this.macroAction).setMouseButtons(this.selectedButtons);
        this.validate();
    }

    hasButton(index: number): boolean {
        return this.selectedButtons[index];
    }

    getAction(tab: TabName): MacroMouseSubAction {
        switch (tab) {
            case TabName.Click:
                return MacroMouseSubAction.click;
            case TabName.Hold:
                return MacroMouseSubAction.hold;
            case TabName.Release:
                return MacroMouseSubAction.release;
            default:
                throw new Error(`Invalid tab name: ${TabName[tab]}`);
        }
    }

    getTabName(action: MouseMacroAction): TabName {
        if (action instanceof MouseButtonMacroAction) {
            if (!action.action || action.isOnlyClickAction()) {
                return TabName.Click;
            } else if (action.isOnlyHoldAction()) {
                return TabName.Hold;
            } else if (action.isOnlyReleaseAction()) {
                return TabName.Release;
            }
        } else if (action instanceof MoveMouseMacroAction) {
            return TabName.Move;
        } else if (action instanceof ScrollMouseMacroAction) {
            return TabName.Scroll;
        }
        return TabName.Move;
    }

    isMacroValid = () => {
        switch (this.macroAction.constructor) {
            case MoveMouseMacroAction:
            case ScrollMouseMacroAction:
                const {x, y} = this.macroAction as MoveMouseMacroAction;
                return x !== undefined && x !== null && y !== undefined && y !== null &&
                    (x !== 0 || y !== 0) && x < 10000 && x > -10000 && y < 10000 && y > -10000;
            case MouseButtonMacroAction:
                const {mouseButtonsMask} = this.macroAction as MouseButtonMacroAction;
                return !!mouseButtonsMask;
            default:
                return true;
        }
    };
}
