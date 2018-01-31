import {BrowserModule} from "@angular/platform-browser";
import {NgModule, CUSTOM_ELEMENTS_SCHEMA} from "@angular/core";
import {AppComponent} from "./app.component";
import {GithubStatComponent} from "./github-stat/github-stat.component";
import {GithubStatService} from "./github-stat.service";
import {HttpModule} from "@angular/http";
import {D3Service} from "d3-ng2-service";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {FormsModule, FormBuilder, ReactiveFormsModule} from "@angular/forms";
import {SelectModule} from "ng2-select";

@NgModule({
    declarations: [
        AppComponent,
        GithubStatComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        NgxChartsModule,
        HttpModule,
        SelectModule,
        ReactiveFormsModule,
    ],
    providers: [
        GithubStatService,
        FormBuilder,
        D3Service
    ],
    bootstrap: [AppComponent],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA
    ]
})
export class AppModule {
}
