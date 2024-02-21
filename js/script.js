let docTitle = document.title;
window.addEventListener("blur", () => {
  document.title = "¡Regresa! ☹";
});
window.addEventListener("focus", () => {
  document.title = docTitle;
});
document.addEventListener("DOMContentLoaded", function () {
  let data = [];

  const addDataBtn = document.getElementById("add-data-btn");
  const plotGraphBtn = document.getElementById("plot-graph-btn");
  const dataTable = document.getElementById("data-table");

  addDataBtn.addEventListener("click", function () {
    const newRow = document.createElement("tr");
    newRow.innerHTML = `
            <td><input type="number" class="input-x"></td>
            <td><input type="number" class="input-y"></td>
            <td><button class="btn danger delete-btn">Eliminar
            <img src="./assets/boton-x.png" alt="Eliminar" width="30px" height="30px"" ></button></td>
        `;
    dataTable.appendChild(newRow);
  });

  dataTable.addEventListener("click", function (event) {
    if (
      event.target.classList.contains("delete-btn") ||
      event.target.parentElement.classList.contains("delete-btn")
    ) {
      event.target.closest("tr").remove();
    }
  });

  plotGraphBtn.addEventListener("click", function () {
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
      data = [];
    }
  });

  function drawGraph(data) {
    const margin = { top: 20, right: 20, bottom: 90, left: 90 }; // Aumentamos el espacio inferior para dejar espacio al texto
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    //Datos del nombre de las variables para el titulo de la grafica
    let inputX = document.getElementById("inputX").value;
    let inputY = document.getElementById("inputY").value;
    //Inicializar el nombre de las variables por defecto x,y

    if (inputX.trim() === "" && inputY.trim() === "") {
      inputX = "X";
      inputY = "Y";
    }

    // Selecciona el contenedor SVG y elimina su contenido previo antes de añadir uno nuevo
    const svgContainer = d3.select("#graph-container");
    svgContainer.selectAll("*").remove();

    const svg = svgContainer
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.x)])
      .range([0, width]);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.y)])
      .range([height, 0]);

    const xAxis = d3.axisBottom().scale(xScale);
    const yAxis = d3.axisLeft().scale(yScale);

    // Añadir ejes X e Y a la gráfica
    svg
      .append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);

    svg
      .append("g")
      .call(yAxis);

    // Agregar etiquetas a los ejes
    svg
      .append("text")
      .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text(inputX);

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text(inputY);

    // Dibujar puntos de dispersión
    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
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
    const coefficientOfDetermination = 1 - SSResidual / SSTotal;

    // Dibujar línea de tendencia
    const line = d3
      .line()
      .x((d) => xScale(d.x))
      .y((d) => yScale(slope * d.x + intercept))
      .curve(d3.curveLinear); // asegúrate de que la línea sea suave

    svg
      .append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("d", line)
      .attr("opacity", 0.8); // ajusta la opacidad

    // Mostrar ecuación de la línea y coeficiente R^2
    let equationText = `${inputY} =  ${slope.toFixed(
      2
    )} ${inputX}  + ${intercept.toFixed(2)} `;

    if (intercept.toFixed(2) < 0) {
      equationText = `${inputY} =  ${slope.toFixed(
        2
      )} ${inputX}  ${intercept.toFixed(2)} `;
    }

    const rSquaredText = `R² = ${coefficientOfDetermination.toFixed(5)}`;
    const titleG = `${inputX} Frente a ${inputY}`;
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / +5) // Ajustamos la posición vertical para evitar superposición
      .attr("text-anchor", "middle")
      .text(titleG)
      .style("font-size", "18px")
      .style("fill", "black");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2 + 22)
      .attr("text-anchor", "middle")
      .text(equationText)
      .style("font-size", "14px")
      .style("fill", "black");

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -margin.top / 2 + 40) // Ajustamos la posición vertical para evitar superposición
      .attr("text-anchor", "middle")
      .text(rSquaredText)
      .style("font-size", "14px")
      .style("fill", "black");
  }
});
