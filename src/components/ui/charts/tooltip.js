export const tooltip = (context, valueFormatter, chartType = 'bar') => {
    const { chart, tooltip } = context;
    let tooltipEl = chart.canvas.parentNode.querySelector('div.chartjs-tooltip');
    if (!tooltipEl) {
        tooltipEl = document.createElement('div');
        tooltipEl.classList.add(
            'chartjs-tooltip',
            'dark:bg-surface-950',
            'bg-surface-0',
            'rounded-[8px]',
            'overflow-hidden',
            'opacity-100',
            'border',
            'border-surface',
            'absolute',
            'transition-all',
            'duration-[0.05s]',
            'pointer-events-none',
            'shadow-[0px_16px_32px_-12px_rgba(88,92,95,0.10)]',
            'z-20',
            'absolute'
        );
        chart.canvas.parentNode.appendChild(tooltipEl);
    }

    if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
    }

    const datasetPointsX = tooltip.dataPoints.map((dp) => dp.element.x);
    const avgX = datasetPointsX.reduce((a, b) => a + b, 0) / datasetPointsX.length;

    if (tooltip.body) {
        tooltipEl.innerHTML = '';
        const tooltipHeader = document.createElement('div');
        tooltipHeader.classList.add('bg-surface-100', 'dark:bg-surface-900', 'px-3', 'py-2.5', 'border-b', 'border-surface', 'text-surface-500', 'font-medium');
        tooltipHeader.appendChild(document.createTextNode(tooltip.title[0]));
        tooltipEl.appendChild(tooltipHeader);

        const tooltipBody = document.createElement('div');
        tooltipBody.classList.add('flex', 'flex-col', 'gap-2', 'px-3', 'py-2', 'min-w-[11rem]');

        tooltip.dataPoints.reverse().forEach((body) => {
            const row = document.createElement('div');
            row.classList.add('flex', 'items-center', 'gap-2', 'w-full');

            const point = document.createElement('div');
            point.classList.add('w-2.5', 'h-2.5', 'rounded-[2px]');

            let color;
            if (chartType === 'line') {
                color = body.dataset.borderColor?.replace(/[^,]+(?=\))/, '1');
            } else {
                color = body.dataset.tooltipBackgroundColor?.(body.parsed) || (body.dataset.backgroundColor instanceof Function ? body.dataset.backgroundColor(body.parsed) : body.dataset.backgroundColor)?.replace(/[^,]+(?=\))/, '1');
            }

            point.style.backgroundColor = color;

            row.appendChild(point);

            const label = document.createElement('span');
            label.appendChild(document.createTextNode(body.dataset.label));
            label.classList.add('text-surface-500', 'text-sm', 'flex-1', 'text-left', 'capitalize');
            row.appendChild(label);

            const value = document.createElement('span');
            value.appendChild(document.createTextNode(valueFormatter(body.formattedValue)));
            value.classList.add('text-sm', 'font-medium', 'text-surface-950', 'dark:text-surface-0', 'text-right');
            row.appendChild(value);

            tooltipBody.appendChild(row);
        });

        tooltipEl.appendChild(tooltipBody);
    }

    const { offsetLeft: positionX } = chart.canvas;

    tooltipEl.style.opacity = 1;
    tooltipEl.style.font = tooltip.options.bodyFont.string;
    tooltipEl.style.padding = 0;

    const chartWidth = chart.width;
    const tooltipWidth = tooltipEl.offsetWidth;
    const OFFSET = 20;

    // Start with tooltip on the right side of the point
    let tooltipX = positionX + avgX + OFFSET;
    const tooltipY = 0;

    // If tooltip would extend beyond the right edge of the chart
    if (tooltipX + tooltipWidth > positionX + chartWidth) {
        // Move tooltip to the left side of the point
        tooltipX = positionX + avgX - tooltipWidth - OFFSET;
    }

    if (tooltipX < positionX + OFFSET) {
        tooltipX = positionX + OFFSET;
    }

    tooltipEl.style.left = tooltipX + 'px';
    tooltipEl.style.top = tooltipY + 'px';
};
