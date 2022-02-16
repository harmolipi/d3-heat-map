const url =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json';

const getTempData = () => d3.json(url);
const colors = [
  '#67001f',
  '#b2182b',
  '#d6604d',
  '#f4a582',
  '#fddbc7',
  '#f7f7f7',
  '#d1e5f0',
  '#92c5de',
  '#4393c3',
  '#2166ac',
  '#053061',
];

getTempData()
  .then((data) => callback(data))
  .catch((err) => console.log(err));

const callback = (data) => {
  console.log(data);

  data.monthlyVariance.forEach((val) => {
    val.month -= 1;
  });

  const section = d3.select('body').append('section');

  // Heading
  const heading = section.append('heading');
  heading
    .append('h1')
    .attr('id', 'title')
    .text('Monthly Global Land-Surface Temperature');
  heading
    .append('h2')
    .attr('id', 'description')
    .html(
      data.monthlyVariance[0].year +
        ' - ' +
        data.monthlyVariance[data.monthlyVariance.length - 1].year +
        ': base temperature ' +
        data.baseTemperature +
        '&#8451;'
    );

  const fontSize = 16;
  const width = 7 * Math.ceil(data.monthlyVariance.length / 12);
  const height = 12 * 33;
  const padding = {
    left: 9 * fontSize,
    right: 9 * fontSize,
    top: 1 * fontSize,
    bottom: 8 * fontSize,
  };

  const tip = d3
    .tip()
    .attr('class', 'd3-tip')
    .attr('id', 'tooltip')
    .html((d) => d)
    .direction('n')
    .offset([-10, 0]);

  const svg = section
    .append('svg')
    .attr('width', width + padding.left + padding.right)
    .attr('height', height + padding.top + padding.bottom)
    .call(tip);

  const yScale = d3
    .scaleBand()
    .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
    .range([padding.top, height - (padding.bottom + padding.top)]);

  const yAxis = d3
    .axisLeft()
    .scale(yScale)
    .tickValues(yScale.domain())
    .tickFormat((month) => {
      console.log('month ', month);
      let date = new Date(0);
      console.log('date ', date);
      date.setUTCMonth(month + 1);
      const format = d3.timeFormat('%B');
      console.log('format ', format(date));
      return format(date);
    });

  svg
    .append('g')
    .classed('y-axis', true)
    .attr('id', 'y-axis')
    .attr('transform', `translate(${padding.left},${padding.top})`)
    .call(yAxis)
    .append('text')
    .text('Months')
    .style('text-anchor', 'middle')
    .attr('transform', `translate(${-7 * fontSize},${height / 3})rotate(-90)`)
    .attr('fill', 'black');

  const xScale = d3
    .scaleBand()
    .domain(data.monthlyVariance.map((d) => d.year)) // Years
    .range([0, width]);

  const xAxis = d3
    .axisBottom()
    .scale(xScale)
    .tickValues(xScale.domain().filter((year) => year % 10 === 0))
    .tickFormat((year) => {
      let date = new Date(0);
      date.setUTCFullYear(year);
      const formatDate = d3.timeFormat('%Y');
      return formatDate(date);
    })
    .tickSize(10, 1);

  svg
    .append('g')
    .attr('id', 'x-axis')
    .classed('x-axis', true)
    .attr('transform', `translate(${padding.left}, ${height - padding.bottom})`)
    .call(xAxis)
    .append('text')
    .text('Years')
    .style('text-anchor', 'middle')
    .attr('transform', `translate(${width / 2}, 40)`)
    .attr('fill', 'black');

  const legendColors = colors.reverse();
  const legendWidth = 400;
  const legendHeight = 300 / legendColors.length;

  const variance = data.monthlyVariance.map((val) => val.variance);
  const minTemp = data.baseTemperature + d3.min(variance);
  const maxTemp = data.baseTemperature + d3.max(variance);

  const legendThreshold = d3
    .scaleThreshold()
    .domain(
      ((min, max, count) => {
        const array = [];
        const step = (max - min) / count;
        const base = min;
        for (let i = 1; i < count; i++) {
          array.push(base + i * step);
        }
        return array;
      })(minTemp, maxTemp, legendColors.length)
    )
    .range(legendColors);

  const legendX = d3
    .scaleLinear()
    .domain([minTemp, maxTemp])
    .range([0, legendWidth]);

  const legendXAxis = d3
    .axisBottom()
    .scale(legendX)
    .tickSize(10, 0)
    .tickValues(legendThreshold.domain())
    .tickFormat(d3.format('.1f'));

  const legend = svg
    .append('g')
    .classed('legend', true)
    .attr('id', 'legend')
    .attr(
      'transform',
      `translate(${padding.left},${padding.top + height - legendHeight})`
    );

  legend
    .append('g')
    .selectAll('rect')
    .data(
      legendThreshold.range().map((color) => {
        const d = legendThreshold.invertExtent(color);
        if (d[0] === null) {
          d[0] = legendX.domain()[0];
        }
        if (d[1] === null) {
          d[1] = legendX.domain()[1];
        }
        return d;
      })
    )
    .enter()
    .append('rect')
    .style('fill', (d) => legendThreshold(d[0]))
    .attr('x', (d) => legendX(d[0]))
    .attr('y', 0)
    .attr('width', (d) =>
      d[0] && d[1] ? legendX(d[1]) - legendX(d[0]) : legendX(null)
    )
    .attr('height', legendHeight);

  legend
    .append('g')
    .attr('transform', `translate(0,${legendHeight})`)
    .call(legendXAxis);

  // map
  svg
    .append('g')
    .classed('map', true)
    .attr('transform', `translate(${padding.left}, ${padding.top})`)
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
    .attr('width', (d) => xScale.bandwidth(d.year))
    .attr('height', (d) => yScale.bandwidth(d.month))
    .attr('fill', (d) => legendThreshold(data.baseTemperature + d.variance))
    .on('mouseover', function (_event, d) {
      const date = new Date(d.year, d.month);
      const str = `<span class='date'>${d3.timeFormat('%Y - %B')(
        date
      )}</span><br /><span class='temperature'>${d3.format('.1f')(
        data.baseTemperature + d.variance
      )}°</span><br /><span class='variance'>${d3.format('+.1f')(
        d.variance
      )}°</span>`;
      tip.attr('data-year', d.year);
      tip.show(str, this);
    })
    .on('mouseout', tip.hide);
};
