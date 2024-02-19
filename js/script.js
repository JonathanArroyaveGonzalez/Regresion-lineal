document.addEventListener("DOMContentLoaded", function() {
    const data = [];

    const addDataBtn = document.getElementById("add-data-btn");
    const plotGraphBtn = document.getElementById("plot-graph-btn");
    const dataTable = document.getElementById("data-table");

    addDataBtn.addEventListener("click", function() {
        const newRow = document.createElement("tr");
        newRow.innerHTML = `
            <td><input type="number" class="input-x"></td>
            <td><input type="number" class="input-y"></td>
            <td><button class="delete-btn">Eliminar</button></td>
        `;
        dataTable.appendChild(newRow);
    });

    dataTable.addEventListener("click", function(event) {
        if (event.target.classList.contains("delete-btn")) {
            event.target.parentElement.parentElement.remove();
        }
    });

    plotGraphBtn.addEventListener("click", function() {
        const inputXElements = document.querySelectorAll(".input-x");
        const inputYElements = document.querySelectorAll(".input-y");

        inputXElements.forEach((inputX, index) => {
            const x = parseFloat(inputX.value);
            const y = parseFloat(inputYElements[index].value);
            if (!isNaN(x) && !isNaN(y)) {
                data.push({ x, y });
            }
        });

        if (data.length > 0) {
            drawGraph(data);
        }
    });

    function drawGraph(data) {
        const margin = { top: 20, right: 20, bottom: 90, left: 90 }; // Aumentamos el espacio inferior para dejar espacio al texto
        const width = 600 - margin.left - margin.right;
        const height = 400 - margin.top - margin.bottom;
    
        const svg = d3.select("#graph-container").append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
        const xScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.x)])
            .range([0, width]);
    
        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.y)])
            .range([height, 0]);
    
        const xAxis = d3.axisBottom().scale(xScale);
        const yAxis = d3.axisLeft().scale(yScale);
    
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    
        svg.append("g")
            .call(yAxis);
    
        // Dibujar puntos de dispersión
        svg.selectAll("circle")
            .data(data)
            .enter().append("circle")
                .attr("cx", d => xScale(d.x))
                .attr("cy", d => yScale(d.y))
                .attr("r", 5)
                .attr("fill", "steelblue")
                .attr("opacity", 0.7); // ajusta la opacidad
    
        // Calcular regresión lineal manualmente
        const n = data.length;
        const xSum = data.reduce((acc, d) => acc + d.x, 0);
        const ySum = data.reduce((acc, d) => acc + d.y, 0);
        const xySum = data.reduce((acc, d) => acc + d.x * d.y, 0);
        const xSquaredSum = data.reduce((acc, d) => acc + d.x * d.x, 0);
    
        const slope = (n * xySum - xSum * ySum) / (n * xSquaredSum - xSum * xSum);
        const intercept = (ySum - slope * xSum) / n;
    
        // Calcular coeficiente de determinación (R^2)
        const yMean = ySum / n;
        const SSTotal = data.reduce((acc, d) => acc + Math.pow(d.y - yMean, 2), 0);
        const SSResidual = data.reduce((acc, d) => {
            const yPredicted = slope * d.x + intercept;
            return acc + Math.pow(d.y - yPredicted, 2);
        }, 0);
        const coefficientOfDetermination = 1 - (SSResidual / SSTotal);
    
        // Dibujar línea de tendencia
        const line = d3.line()
            .x(d => xScale(d.x))
            .y(d => yScale(slope * d.x + intercept))
            .curve(d3.curveLinear); // asegúrate de que la línea sea suave
    
        svg.append("path")
            .datum(data)
            .attr("fill", "none")
            .attr("stroke", "red")
            .attr("stroke-width", 2)
            .attr("d", line)
            .attr("opacity", 0.8); // ajusta la opacidad
    
        // Mostrar ecuación de la línea y coeficiente R^2
        const equationText = `y = ${intercept.toFixed(2)} + ${slope.toFixed(2)}x`;
        const rSquaredText = `R² = ${coefficientOfDetermination.toFixed(2)}`;
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2)
            .attr("text-anchor", "middle")
            .text(equationText)
            .style("font-size", "14px")
            .style("fill", "black");
    
        svg.append("text")
            .attr("x", width / 2)
            .attr("y", -margin.top / 2 + 20) // Ajustamos la posición vertical para evitar superposición
            .attr("text-anchor", "middle")
            .text(rSquaredText)
            .style("font-size", "14px")
            .style("fill", "black");
    }
    
    
    
    
});