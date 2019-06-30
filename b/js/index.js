
const Holder = (data) => {
  const H = 600, W = 1000;
  const height = H - 100;
  const width = W - 200;
  const color1 = '#da2f2fed', color2 = '#188deae0';

  const Canvas = d3.select('#canvas');
  
  const divDisplay = Canvas.append('div')
      .attr('id', 'tooltip');
  
  const Svg = Canvas.append('svg')
    .attr('width', W)
    .attr('height', H);

  const centerSvg = Svg.append('g')
    .attr('transform', 'translate(100, 50)');
  
  
  const Time = d3.extent(data, d => d.Time);
  const Year = d3.extent(data, d => d.Year);
  const timeFormat = d3.timeFormat("%M:%S");
  
  const converter = (time, option) => {
    let date = new Date();
    time = option != undefined? time[option]: time;
    date.setMinutes(time.replace(/:\d+$/,''));
    date.setSeconds(time.replace(/^\d+:/,''));
    return date;
  }
  
  const maxTime = converter(Time, 1);
  const minTime = converter(Time, 0);
  
  const xScale = d3.scaleLinear()
    .domain([Year[0]-1, Year[1]+1])
    .range([0, width]);

  const yScale = d3.scaleTime()
    .domain([minTime, maxTime])
    .range([0, height]);
  
  const xAxis = d3.axisBottom(xScale)
    .tickFormat(d3.format('d'));
  
  const yAxis = d3.axisLeft(yScale)
    .tickFormat(timeFormat);
  
  centerSvg.append('g')
    .attr('id', 'x-axis')
    .attr('transform', `translate(0, ${height})`)
    .call(xAxis);
  
  centerSvg.append('g')
    .attr('id', 'y-axis')
    .call(yAxis)
    .append('text')
    // text sections
    .text('Time in Minutes')
    .attr('fill', '#000')
    .attr('x', -50)
    .attr('y', -50)
    .attr('font-size', '18px')
    .attr('transform', 'rotate(-90)');
  
  centerSvg.selectAll('circle')
    .data(data)
    .enter()
    .append('circle')
    .attr('class', 'dot')
    .attr('fill', d => d.Doping? color1: color2)
    .attr('cx', d => xScale(d.Year))
    .attr('cy', d => yScale(converter(d.Time)))
    .attr('r', 6)
    .attr('stroke', '#000')
    .attr('opacity', .9)
    .attr('data-xvalue', d => d.Year)
    .attr('data-yvalue', d => converter(d.Time))
    .on('mouseover', (d, i) => {
      divDisplay.html(`
          <p>
            ${d.Name}: ${d.Nationality}<br/>
            Year: ${d.Year}, Time: ${d.Time}
          </p>
          <p>${d.Doping}</p> 
      `)
      .style('opacity', .9)
      .style('left', 110 + xScale(d.Year) + 'px')
      .style('top', 10 + yScale(converter(d.Time)) + 'px')
      .attr("data-year", d.Year)
    })
    .on('mouseout', d => {
      divDisplay.style('opacity', 0)
        .style('top', 0)
        .style('left', W)
    })
  
  const g = height => centerSvg.append('g')
    .attr('id', 'legend')
    .attr('transform', `translate(${width - 18}, ${height})`);
  
  const status = (func, height, color, text) => {
    let obj = func(height);
    obj.append('rect')
      .attr('fill', color)
      .attr('width', '18px')
      .attr('height', '18px')
      .attr('y', '-14');
    obj.append('text').text(text)
      .style("text-anchor", "end")
      .attr('x', '-7px')
      .attr('font-size', '12px');
  }
  
  status(g, 222, color1, 'Riders with doping allegations')
  status(g, 200, color2, 'No doping allegations')

}


fetch('https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json').then(d => d.json()).then( d => Holder(d))
