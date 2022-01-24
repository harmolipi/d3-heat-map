const url =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const getTempData = () => d3.json(url);

getTempData()
  .then((data) => callback(data))
  .catch((err) => console.log(err));

const callback = (data) => {
  console.log(data);

  const width = 7 * Math.ceil(data.monthlyVariance.length / 12);
  const height = 33 * 12;
  const padding = 30;

  const svg = d3
    .select('body')
    .insert('div', ':first-child')
    .attr('id', '#chart-container')
    .append('svg')
    .attr('width', width + padding)
    .attr('height', height);

  addHeader(data);

  const xScale = d3
    .scaleBand()
    .domain(data.monthlyVariance.map((d) => d.year)) // Years
    .range([0, width]);

  const yScale = d3
    .scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]) // Months
    .range([0, height]);

  const variance = data.monthlyVariance.map((d) => d.variance);

  svg
    .append('g')
    .attr('class', 'map')
    .attr('transform', `translate('${padding}, ${padding}')`)
    .selectAll('rect')
    .data(data.monthlyVariance)
    .enter()
    .append('rect')
    .attr('class', 'cell')
    .attr('data-month', (d) => d.month)
    .attr('data-year', (d) => d.year)
    .attr('data-temp', (d) => data.baseTemperature + d.variance)
    .attr('x', (d) => xScale(d.year))
    .attr('y', (d) => yScale(d.month))
    .attr('fill', 'blue');
};

const addHeader = (data) => {
  const section = d3
    .select('body')
    .insert('section', ':first-child')
    .attr('id', 'header');
  section
    .append('h1')
    .attr('id', 'title')
    .text('Monthly Global Land-Surface Temperature');
  section
    .append('h2')
    .attr('id', 'description')
    .html(
      `${data.monthlyVariance[0].year} - ${
        data.monthlyVariance[data.monthlyVariance.length - 1].year
      }: base temperature ${data.baseTemperature} ℃`
    );
};
