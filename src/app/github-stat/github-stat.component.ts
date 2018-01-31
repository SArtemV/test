import {map, orderBy, chain, find, get} from 'lodash';
import {Component, OnInit, Input, ElementRef} from '@angular/core';
import {GithubStatService} from "../github-stat.service";
import {
    D3Service,
    D3,
    Axis,
    BrushBehavior,
    BrushSelection,
    D3BrushEvent,
    ScaleLinear,
    ScaleOrdinal,
    Selection,
    Transition
} from 'd3-ng2-service';
import {FormGroup, FormControl, FormBuilder, Validators} from "@angular/forms";

@Component({
    selector: 'app-github-stat',
    templateUrl: 'github-stat.component.html',
    styleUrls: ['github-stat.component.css']
})
export class GithubStatComponent implements OnInit {

    private d3: D3; // <-- Define the private member which will hold the d3 reference
    private parentNativeElement: any;

    private data: {name: string, yVal: number}[] = [];
    private commits: {sha: string, month: string, monthNumber: number, date: string}[] = [];
    private width: number = 800;
    private height: number = 500;
    private xAxis: any;
    private yAxis: any;
    private chart: any;
    private xChart: any;
    private yChart: any;
    private margin = {top: 20, right: 20, bottom: 95, left: 50};

    public isLoadData: boolean = false;

    public statForm: FormGroup;
    //Form elements
    private repo: FormControl;
    private owner: FormControl;
    private author: FormControl;

    public authors:Array<string> = ['petebacondarwin','gkalpak','tbosch'];

    results: any[] = []; // This will hold the data coming from the service
    error_text: string = "";

    constructor(private searchService: GithubStatService,
                private element: ElementRef,
                private _fb: FormBuilder,
                d3Service: D3Service) {
        this.d3 = d3Service.getD3(); // <-- obtain the d3 object from the D3 Service
        this.parentNativeElement = element.nativeElement;
    }

    ngOnInit() {
        this._initChart();
        this._formInit()
    }

    search() {
        this.commits = [];
        this.data = [];
        this._updateData();
        this.isLoadData = true;
        if (this.statForm.value.author[0].text) {
            this.parseCommits(this.statForm.value.author[0].text, 1);
        }
    }

    parseCommits(author, page) {
        this.searchService.getUsersByPlaceAndLanguage(author, page).subscribe(
            data => {
                this.commits = this.commits.concat(data);
                if (data.length == 100) {
                    this.parseCommits(author, page + 1);
                } else {
                    this._prepareData();
                    this._updateData();
                    this.isLoadData = false;
                }
            },
            error => {
                this.results = [];
                this.error_text = "Sorry! We have some errors";
                console.error(error);
            }
        )
    }

    private _prepareData() {
        this.data = chain(this.commits)
            .groupBy("monthNumber")
            .orderBy("monthNumber")
            .map(function (v, i) {
                return {
                    name: GithubStatService.getMonthNameByNumber(i),
                    _yVal: map(v, 'sha'),
                    yVal: map(v, 'sha').length
                }
            })
            .value();
    }

    private _initChart() {
        this.chart = this.d3.select(".chart")
            .attr("width", this.width + this.margin.left + this.margin.right)
            .attr("height", this.height + this.margin.top + this.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

        this.xChart = this.d3.scaleBand()
            .range([0, this.width]);

        this.yChart = this.d3.scaleLinear()
            .range([this.height, 0]);

        this.xAxis = this.d3.axisBottom(this.xChart);
        this.yAxis = this.d3.axisLeft(this.yChart);
        this.chart.append("g")
            .attr("class", "y axis")
            .call(this.yAxis)

        this.chart.append("g")
            .attr("class", "xAxis")
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function (d) {
                return "rotate(-65)";
            });

        //add labels
        this.chart
            .append("text")
            .attr("transform", "translate(-35," + (this.height + this.margin.bottom) / 2 + ") rotate(-90)")
            .text("count of commits");
        this.chart
            .append("text")
            .attr("transform", "translate(" + (this.width / 2) + "," + (this.height + this.margin.bottom - 5) + ")")
            .text("month");
    }

    private _formInit() {
        this.owner = new FormControl({value: 'angular', disabled: true}, [Validators.required, Validators.minLength(3)]);
        this.repo = new FormControl({value: 'angular', disabled: true}, [Validators.required, Validators.minLength(3)]);
        this.author = new FormControl('', [Validators.required]);

        this.statForm = this._fb.group({
            owner: this.owner,
            repo: this.repo,
            author: this.author,
        });
    }

    private _updateData() {
        //set domain for the x axis
        this.xChart.domain(this.data.map(function (d) {
            return d.name;
        }));
        //set domain for y axis
        let yChart = this.yChart.domain([0, this.d3.max(this.data, function (d) {
            return +d.yVal;
        })]);

        //get the width of each bar
        let barWidth = this.width / this.data.length;

        //select all bars on the graph, take them out, and exit the previous data set.
        //then you can add/enter the new data set
        let bars = this.chart.selectAll(".bar")
            .remove()
            .exit()
            .data(this.data)
        //now actually give each rectangle the corresponding data
        let height = this.height;
        bars.enter()
            .append("rect")
            .attr("class", "bar")
            .attr("x", function (d, i) {
                return i * barWidth + 1
            })
            .attr("y", function (d) {
                return yChart(d.yVal);
            })
            .attr("height", function (d) {
                return height - yChart(d.yVal);
            })
            .attr("width", barWidth - 1)
            .attr("fill", function (d) {
                return "rgb(251,180,174)";
            });
        //left axis
        this.chart.select('.y')
            .call(this.yAxis)
        //bottom axis
        this.chart.select('.xAxis')
            .attr("transform", "translate(0," + this.height + ")")
            .call(this.xAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "-.8em")
            .attr("dy", ".15em")
            .attr("transform", function (d) {
                return "rotate(-65)";
            });

    }
}

