import React from "react"

interface HeadingProps {
    title: string
    description?: string
    level?: 1 | 2 | 3 | 4 | 5 | 6
    className?: string
}

export default function Heading({
    title,
    description,
    level = 2,
    className = ""
}: HeadingProps) {
    const baseClasses = {
        1: "text-3xl font-bold tracking-tight",
        2: "text-xl font-semibold tracking-tight",
        3: "text-lg font-semibold",
        4: "text-base font-semibold",
        5: "text-sm font-semibold",
        6: "text-xs font-semibold"
    }

    const headingProps = {
        className: baseClasses[level],
        children: title
    }

    return (
        <div className={`mb-8 space-y-0.5 ${className}`}>
            {level === 1 && <h1 {...headingProps} />}
            {level === 2 && <h2 {...headingProps} />}
            {level === 3 && <h3 {...headingProps} />}
            {level === 4 && <h4 {...headingProps} />}
            {level === 5 && <h5 {...headingProps} />}
            {level === 6 && <h6 {...headingProps} />}
            {description && (
                <p className="text-muted-foreground text-sm">
                    {description}
                </p>
            )}
        </div>
    )
}
