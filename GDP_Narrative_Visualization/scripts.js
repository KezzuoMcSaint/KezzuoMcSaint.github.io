d3.csv("gdp_data_preprocessed.csv").then(function(data) {
    console.log("Data loaded: ", data);

    data.forEach(d => {
        d.Year = +d.Year;
        d.Value = +d.Value;
    });

    const margin = { top: 20, right: 100, bottom: 100, left: 70 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3.select("#chart")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear()
        .domain(d3.extent(data, d => d.Year))
        .range([0, width]);

    const y = d3.scaleLinear()
        .domain([d3.min(data, d => d.Value) - 1, d3.max(data, d => d.Value) + 1])
        .range([height, 0]);

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.format("d")));

    svg.append("g")
        .call(d3.axisLeft(y).ticks(10));

    svg.append("text")
        .attr("transform", `translate(${width / 2},${height + margin.bottom - 40})`)
        .style("text-anchor", "middle")
        .text("Year");

    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("GDP Growth Rate (%)");

    const line = d3.line()
        .x(d => x(d.Year))
        .y(d => y(d.Value));

    const countries = d3.nest()
        .key(d => d['Country Name'])
        .entries(data);

    let currentScene = 0;

    const scenes = [
        { title: "Global GDP Growth Rate Over Time", filter: d => d['Country Name'] === "World" },
        { title: "GDP Growth Rate in USA", filter: d => d['Country Name'] === "United States" },
        { title: "GDP Growth Rate in Russia", filter: d => d['Country Name'] === "Russian Federation" },
        { title: "GDP Growth Rate in China", filter: d => d['Country Name'] === "China" },
        { title: "Select a Country", filter: null }
    ];

    const colors = {
        "World": "green",
        "United States": "blue",
        "China": "red",
        "Russian Federation": "orange",
        "User": "purple"
    };

    function showScene(sceneIndex) {
        svg.selectAll(".line").remove();
        svg.selectAll(".dot").remove();
        svg.selectAll(".scene-text").remove();
        d3.selectAll(".country-selector").remove();
        d3.select("#legend").remove();

        const scene = scenes[sceneIndex];
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -10)
            .attr("class", "scene-text")
            .style("text-anchor", "middle")
            .style("font-size", "16px")
            .text(scene.title);

        const tooltip = d3.tip()
            .attr('class', 'd3-tip')
            .offset([-10, 0])
            .html(d => `<strong>Year:</strong> <span style='color:red'>${d.Year}</span><br><strong>Value:</strong> <span style='color:red'>${d.Value}</span>`);

        svg.call(tooltip);

        if (scene.filter) {
            const filteredData = data.filter(scene.filter);
            svg.append("path")
                .datum(filteredData)
                .attr("fill", "none")
                .attr("stroke", colors[filteredData[0]['Country Name']])
                .attr("stroke-width", 1.5)
                .attr("class", "line")
                .attr("d", line);

            svg.selectAll("circle")
                .data(filteredData)
                .enter().append("circle")
                .attr("r", 3)
                .attr("cx", d => x(d.Year))
                .attr("cy", d => y(d.Value))
                .attr("fill", colors[filteredData[0]['Country Name']])
                .attr("class", "dot")
                .on('mouseover', tooltip.show)
                .on('mouseout', tooltip.hide);
        } else {
            const referenceCountries = ["World"];
            referenceCountries.forEach(country => {
                const referenceData = data.filter(d => d['Country Name'] === country);
                svg.append("path")
                    .datum(referenceData)
                    .attr("fill", "none")
                    .attr("stroke", colors[country])
                    .attr("stroke-width", 1.5)
                    .attr("class", "line")
                    .attr("d", line);

                svg.selectAll("circle")
                    .data(referenceData)
                    .enter().append("circle")
                    .attr("r", 3)
                    .attr("cx", d => x(d.Year))
                    .attr("cy", d => y(d.Value))
                    .attr("fill", colors[country])
                    .attr("class", "dot")
                    .on('mouseover', tooltip.show)
                    .on('mouseout', tooltip.hide);
            });

            const countrySelector = d3.select("#controls").append("div").attr("class", "country-selector");
            countrySelector.append("label").text("Select a country: ");
            const select = countrySelector.append("select")
                .on("change", function() {
                    const selectedCountry = this.value;
                    const filteredData = data.filter(d => d['Country Name'] === selectedCountry);
                    svg.selectAll(".line.user-line").remove();
                    svg.selectAll(".dot.user-dot").remove();

                    svg.append("path")
                        .datum(filteredData)
                        .attr("fill", "none")
                        .attr("stroke", colors["User"])
                        .attr("stroke-width", 1.5)
                        .attr("class", "line user-line")
                        .attr("d", line);

                    svg.selectAll("circle.user-dot")
                        .data(filteredData)
                        .enter().append("circle")
                        .attr("r", 3)
                        .attr("cx", d => x(d.Year))
                        .attr("cy", d => y(d.Value))
                        .attr("fill", colors["User"])
                        .attr("class", "dot user-dot")
                        .on('mouseover', tooltip.show)
                        .on('mouseout', tooltip.hide);
                });

            select.selectAll("option")
                .data(countries)
                .enter().append("option")
                .attr("value", d => d.key)
                .text(d => d.key);
        }

        const legend = d3.select("#controls").append("div").attr("id", "legend");

        const legendData = scene.filter ? 
            [{ country: scene.filter(data[0]) ? "Global" : scene.title.split(" in ")[1], color: colors[data.filter(scene.filter)[0]['Country Name']] }] :
            [
                { country: "Global", color: colors["World"] },
                { country: "Selected Country", color: colors["User"] }
            ];

        legend.selectAll("div")
            .data(legendData)
            .enter()
            .append("div")
            .style("display", "inline-block")
            .style("margin-right", "20px")
            .html(d => `<span style="color: ${d.color};">&#9679;</span> ${d.country}`);

        if (sceneIndex === scenes.length - 1) {
            d3.select("#start-over").style("display", "inline");
            d3.select("#next-button").style("display", "none");
        } else {
            d3.select("#start-over").style("display", "none");
            d3.select("#next-button").style("display", "inline");
        }
    }

    showScene(currentScene);

    document.getElementById("start-over").addEventListener("click", function() {
        currentScene = 0;
        showScene(currentScene);
    });

    const nextButton = d3.select("#controls").append("button")
        .text("Next")
        .attr("id", "next-button")
        .style("margin", "10px")
        .on("click", function() {
            currentScene = (currentScene + 1) % scenes.length;
            showScene(currentScene);
        });

}).catch(function(error) {
    console.log("Error loading data: ", error);
});