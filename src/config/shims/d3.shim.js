import d3 from 'd3';

window.d3.legend = function(g) {
  g.each(function() {
    var g = d3.select(this);
    var items = {};
    var svg = d3.select(g.property('nearestViewportElement'));
    var legendPadding = g.attr('data-style-padding') || 5;
    var lb = g.selectAll('.legend-box').data([true]);
    var li = g.selectAll('.legend-items').data([true]);

    lb.enter()
      .append('rect')
      .classed('legend-box', true);
    li.enter()
      .append('g')
      .classed('legend-items', true);

    try {
      svg.selectAll('[data-legend]').each(function() {
        var self = d3.select(this);
        items[self.attr('data-legend')] = {
          pos: self.attr('data-legend-pos') || this.getBBox().y,
          color:
            self.attr('data-legend-color') != undefined
              ? self.attr('data-legend-color')
              : self.style('fill') != 'none'
              ? self.style('fill')
              : self.style('stroke'),
        };
      });
    } catch (e) {
      // firefox tends to have issue with hidden elements
      // should continue if it doesn't die here
    }

    items = d3.entries(items).sort(function(a, b) {
      return a.value.pos - b.value.pos;
    });
    var itemOffset = 0;
    li.selectAll('text')
      .data(items, function(d) {
        return d.key;
      })
      .call(function(d) {
        d.enter().append('text');
      })
      .call(function(d) {
        d.exit().remove();
      })
      .attr('y', function(d, i) {
        if (i === 0) {
          return '0em';
        }
        itemOffset += 0.2;
        return i + itemOffset + 'em';
      })
      .attr('x', '1em')
      .text(function(d) {
        return d.key;
      });

    li.selectAll('circle')
      .data(items, function(d) {
        return d.key;
      })
      .call(function(d) {
        d.enter().append('circle');
      })
      .call(function(d) {
        d.exit().remove();
      })
      .attr('cy', function(d, i) {
        return i - 0.25 + 'em';
      })
      .attr('cx', 0)
      .attr('r', '0.4em')
      .style('fill', function(d) {
        return d.value.color;
      });

    // Reposition and resize the box
    var lbbox = li[0][0].getBBox();
    lb.attr('x', lbbox.x - legendPadding)
      .attr('y', lbbox.y - legendPadding)
      .attr('height', lbbox.height + 2 * legendPadding)
      .attr('width', lbbox.width + 2 * legendPadding);
  });
  return g;
};
