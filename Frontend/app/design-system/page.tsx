"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

/**
 * Design System Preview Page
 * Showcases Lego-inspired color palette, typography, and Shadcn/ui components
 */
export default function DesignSystemPage(): React.JSX.Element {
    return (
        <div className="min-h-screen bg-background p-8">
            <div className="max-w-6xl mx-auto space-y-12">
                {/* Header */}
                <header className="space-y-4">
                    <h1 className="font-nunito font-bold text-5xl text-foreground">
                        Lego Builder Design System
                    </h1>
                    <p className="font-inter text-lg text-muted-foreground">
                        A comprehensive showcase of our Lego-inspired design system with colors, typography, and components.
                    </p>
                </header>

                {/* Color Palette */}
                <section className="space-y-6">
                    <h2 className="font-nunito font-semibold text-3xl">Color Palette</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Primary - Lego Blue */}
                        <Card>
                            <CardHeader>
                                <div className="h-24 bg-primary rounded-md mb-4" />
                                <CardTitle className="font-nunito">Primary</CardTitle>
                                <CardDescription>Lego Blue</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <code className="font-jetbrains-mono text-sm">HSL: 210 100% 45%</code>
                                <p className="text-xs mt-2 text-muted-foreground">HEX: #0066e5</p>
                            </CardContent>
                        </Card>

                        {/* Accent - Lego Yellow */}
                        <Card>
                            <CardHeader>
                                <div className="h-24 bg-accent rounded-md mb-4" />
                                <CardTitle className="font-nunito">Accent</CardTitle>
                                <CardDescription>Lego Yellow</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <code className="font-jetbrains-mono text-sm">HSL: 45 100% 50%</code>
                                <p className="text-xs mt-2 text-muted-foreground">HEX: #ffaa00</p>
                            </CardContent>
                        </Card>

                        {/* Destructive - Brick Red */}
                        <Card>
                            <CardHeader>
                                <div className="h-24 bg-destructive rounded-md mb-4" />
                                <CardTitle className="font-nunito">Destructive</CardTitle>
                                <CardDescription>Brick Red</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <code className="font-jetbrains-mono text-sm">HSL: 0 84% 60%</code>
                                <p className="text-xs mt-2 text-muted-foreground">HEX: #eb3333</p>
                            </CardContent>
                        </Card>

                        {/* Muted - Warm Gray */}
                        <Card>
                            <CardHeader>
                                <div className="h-24 bg-muted rounded-md mb-4" />
                                <CardTitle className="font-nunito">Muted</CardTitle>
                                <CardDescription>Warm Gray</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <code className="font-jetbrains-mono text-sm">HSL: 30 10% 96%</code>
                                <p className="text-xs mt-2 text-muted-foreground">HEX: #f5f3f0</p>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Typography */}
                <section className="space-y-6">
                    <h2 className="font-nunito font-semibold text-3xl">Typography</h2>

                    <Card>
                        <CardHeader>
                            <CardTitle className="font-nunito">Font Families</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h3 className="font-nunito font-bold text-4xl mb-2">Nunito Bold</h3>
                                <p className="font-nunito font-semibold text-2xl mb-2">Nunito SemiBold</p>
                                <p className="text-sm text-muted-foreground font-inter">Used for headings and emphasis (weights 600-700)</p>
                            </div>

                            <div>
                                <p className="font-inter text-base mb-2">
                                    Inter Regular - The quick brown fox jumps over the lazy dog
                                </p>
                                <p className="text-sm text-muted-foreground font-inter">Used for body text and UI labels (weight 400)</p>
                            </div>

                            <div>
                                <p className="font-jetbrains-mono font-medium text-lg mb-2">
                                    JetBrains Mono Medium: 127 bricks • 3.14159 • #0066e5
                                </p>
                                <p className="text-sm text-muted-foreground font-inter">Used for stats, numbers, and code (weight 500)</p>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Components */}
                <section className="space-y-6">
                    <h2 className="font-nunito font-semibold text-3xl">Components</h2>

                    {/* Buttons */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-nunito">Buttons</CardTitle>
                            <CardDescription>All button variants with 44px touch targets</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-4">
                            <Button>Default</Button>
                            <Button variant="secondary">Secondary</Button>
                            <Button variant="outline">Outline</Button>
                            <Button variant="ghost">Ghost</Button>
                            <Button variant="destructive">Destructive</Button>
                            <Button variant="link">Link</Button>
                        </CardContent>
                    </Card>

                    {/* Inputs */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-nunito">Input Fields</CardTitle>
                            <CardDescription>Standard input with muted background</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Input placeholder="Enter your text here..." />
                            <Input placeholder="Disabled input" disabled />
                        </CardContent>
                    </Card>

                    {/* Progress */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-nunito">Progress Bars</CardTitle>
                            <CardDescription>Building progress indicators</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <p className="text-sm mb-2">25% Complete</p>
                                <Progress value={25} />
                            </div>
                            <div>
                                <p className="text-sm mb-2">60% Complete</p>
                                <Progress value={60} />
                            </div>
                            <div>
                                <p className="text-sm mb-2">100% Complete</p>
                                <Progress value={100} />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Card Variants */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <Card className="rounded-sm">
                            <CardHeader>
                                <CardTitle className="font-nunito">Small Radius</CardTitle>
                                <CardDescription>8px border radius</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <code className="font-jetbrains-mono text-sm">rounded-sm</code>
                            </CardContent>
                        </Card>

                        <Card className="rounded-md">
                            <CardHeader>
                                <CardTitle className="font-nunito">Medium Radius</CardTitle>
                                <CardDescription>12px border radius</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <code className="font-jetbrains-mono text-sm">rounded-md</code>
                            </CardContent>
                        </Card>

                        <Card className="rounded-lg">
                            <CardHeader>
                                <CardTitle className="font-nunito">Large Radius</CardTitle>
                                <CardDescription>16px border radius</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <code className="font-jetbrains-mono text-sm">rounded-lg</code>
                            </CardContent>
                        </Card>
                    </div>
                </section>

                {/* Grid System */}
                <section className="space-y-6">
                    <h2 className="font-nunito font-semibold text-3xl">8px Grid System</h2>
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-nunito">Spacing Scale</CardTitle>
                            <CardDescription>All spacing values are multiples of 8px</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-2 h-12 bg-primary" title="8px"></div>
                                <code className="font-jetbrains-mono">8px (1 unit)</code>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-4 h-12 bg-primary" title="16px"></div>
                                <code className="font-jetbrains-mono">16px (2 units)</code>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-6 h-12 bg-primary" title="24px"></div>
                                <code className="font-jetbrains-mono">24px (3 units)</code>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-12 bg-primary" title="32px"></div>
                                <code className="font-jetbrains-mono">32px (4 units)</code>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="w-11 h-12 bg-accent" title="44px"></div>
                                <code className="font-jetbrains-mono font-bold">44px (5.5 units) - Touch Target Minimum</code>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* Footer */}
                <footer className="text-center pt-8 border-t border-border">
                    <p className="font-inter text-muted-foreground">
                        Lego Builder Design System • Built with Tailwind CSS 4 + Shadcn/ui
                    </p>
                </footer>
            </div>
        </div>
    );
}
