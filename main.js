const margin = {top: 20, right: 120, bottom: 50, left: 50},
      svgWidth = 900,
      svgHeight = 600,
      width = svgWidth - margin.left - margin.right,
      height = svgHeight - margin.top - margin.bottom;

const svg = d3.select('#visualization')
    .append('svg')
    .attr('width', svgWidth)
    .attr('height', svgHeight)
    .append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

const parseTime = d3.timeParse("%Y");
const xScale = d3.scaleTime().range([0, width]);
const yScale = d3.scaleLinear().range([height, 0]);
const color = d3.scaleOrdinal(d3.schemeCategory10);

d3.csv('gdp_growth_data.csv').then(data => {
    data.forEach(d => {
        d.Year = parseTime(d.Year);
        d['GDP Growth'] = +d['GDP Growth'];
    });

    const countries = Array.from(new Set(data.map(d => d['Country Code'])));
    const countrySelect = d3.select('#countrySelect');
    countrySelect.selectAll('option')
        .data(countries)
        .enter()
        .append('option')
        .text(d => d);

    xScale.domain(d3.extent(data, d => d.Year));
    yScale.domain([0, d3.max(data, d => d['GDP Growth'])]);

    svg.append('g')
        .attr('transform', `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

    svg.append('g')
        .call(d3.axisLeft(yScale));

    const line = d3.line()
        .x(d => xScale(d.Year))
        .y(d => yScale(d['GDP Growth']));

    const nestedData = d3.group(data, d => d['Country Code']);

    const scenes = ['World', 'USA', 'RUS', 'CHN', 'IDN', 'Explore'];
    let currentScene = 0;

    document.addEventListener('click', () => {
        currentScene = (currentScene + 1) % scenes.length;
        renderScene(scenes[currentScene]);
    });

    function renderScene(scene) {
        d3.select('#visualization').selectAll('*').remove();

        switch (scene) {
            case 'World':
                renderWorldScene();
                break;
            case 'USA':
                renderCountryScene('USA');
                break;
            case 'RUS':
                renderCountryScene('RUS');
                break;
            case 'CHN':
                renderCountryScene('CHN');
                break;
            case 'IDN':
                renderCountryScene('IDN');
                break;
            case 'Explore':
                renderExploreScene();
                break;
        }
    }

    function renderWorldScene() {
        svg.selectAll('*').remove();

        const line = d3.line()
            .x(d => xScale(d.Year))
            .y(d => yScale(d['GDP Growth']));

        nestedData.forEach((values, key) => {
            svg.append('path')
                .datum(values)
                .attr('fill', 'none')
                .attr('stroke', color(key))
                .attr('stroke-width', 1.5)
                .attr('d', line)
                .append('title')
                .text(key);
        });
    }

    function renderCountryScene(country) {
        svg.selectAll('*').remove();

        const countryData = nestedData.get(country);
        const line = d3.line()
            .x(d => xScale(d.Year))
            .y(d => yScale(d['GDP Growth']));

        svg.append('path')
            .datum(countryData)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 1.5)
            .attr('d', line);
    }

    function renderExploreScene() {
        svg.selectAll('*').remove();

        const line = d3.line()
            .x(d => xScale(d.Year))
            .y(d => yScale(d['GDP Growth']));

        countrySelect.on('change', function() {
            const selectedCountry = d3.select(this).property('value');
            const countryData = nestedData.get(selectedCountry);
            
            svg.selectAll('*').remove();
            svg.append('path')
                .datum(countryData)
                .attr('fill', 'none')
                .attr('stroke', 'steelblue')
                .attr('stroke-width', 1.5)
                .attr('d', line);
        });

        d3.select('#controls').style('display', 'block');
    }

    renderWorldScene();
});