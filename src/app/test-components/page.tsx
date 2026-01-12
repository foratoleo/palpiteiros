"use client"

export const dynamic = 'force-dynamic'

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import { useToast } from "@/hooks/use-toast"
import { ChevronDown, Circle, Plus, Settings, Star, User } from "lucide-react"

export default function TestComponentsPage() {
  const [switchState, setSwitchState] = React.useState(false)
  const [sliderValue, setSliderValue] = React.useState([50])
  const [commandOpen, setCommandOpen] = React.useState(false)
  const { toast } = useToast()

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Shadcn/UI Components Test</h1>
        <p className="text-muted-foreground">
          Comprehensive test page for all Shadcn/UI components with Apple-inspired interactions
        </p>
      </div>

      <Tabs defaultValue="buttons" className="space-y-8">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 w-full h-auto">
          <TabsTrigger value="buttons">Buttons</TabsTrigger>
          <TabsTrigger value="inputs">Inputs</TabsTrigger>
          <TabsTrigger value="cards">Cards</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="dialogs">Dialogs</TabsTrigger>
          <TabsTrigger value="menus">Menus</TabsTrigger>
          <TabsTrigger value="sliders">Sliders</TabsTrigger>
          <TabsTrigger value="other">Other</TabsTrigger>
        </TabsList>

        {/* Buttons Tab */}
        <TabsContent value="buttons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Button Variants</CardTitle>
              <CardDescription>Test all button variants with interactions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="default">Default</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
                <Button variant="glass">Glass</Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="default" size="sm">Small</Button>
                <Button variant="default" size="default">Default</Button>
                <Button variant="default" size="lg">Large</Button>
                <Button variant="default" size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="default" disabled>Disabled</Button>
                <Button onClick={() => toast({ title: "Button clicked!" })}>
                  Show Toast
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inputs Tab */}
        <TabsContent value="inputs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Input Components</CardTitle>
              <CardDescription>Test input fields and text areas</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="text-input" className="text-sm font-medium">
                  Text Input
                </label>
                <Input id="text-input" placeholder="Enter some text..." />
              </div>
              <div className="space-y-2">
                <label htmlFor="email-input" className="text-sm font-medium">
                  Email Input
                </label>
                <Input id="email-input" type="email" placeholder="email@example.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="password-input" className="text-sm font-medium">
                  Password Input
                </label>
                <Input id="password-input" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <label htmlFor="disabled-input" className="text-sm font-medium">
                  Disabled Input
                </label>
                <Input id="disabled-input" disabled placeholder="Disabled..." />
              </div>
              <div className="space-y-2">
                <label htmlFor="textarea" className="text-sm font-medium">
                  Textarea
                </label>
                <Textarea
                  id="textarea"
                  placeholder="Enter a longer text..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Cards Tab */}
        <TabsContent value="cards" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>Standard card with shadow on hover</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This is a default card variant with smooth hover effects.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle>Glass Card</CardTitle>
                <CardDescription>Glassmorphism effect with blur</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This card uses glassmorphism with backdrop blur.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Action</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>Higher elevation for emphasis</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm">This card has higher elevation for emphasis.</p>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">Action</Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        {/* Badges Tab */}
        <TabsContent value="badges" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Badge Variants</CardTitle>
              <CardDescription>Test all badge variants</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="destructive">Destructive</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="glass">Glass</Badge>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span>Market:</span>
                  <Badge variant="default">Politics</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>Status:</span>
                  <Badge variant="success">Active</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span>Risk:</span>
                  <Badge variant="warning">Medium</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dialogs Tab */}
        <TabsContent value="dialogs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dialog Components</CardTitle>
              <CardDescription>Test dialog and modal variants</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="default">Open Dialog</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Default Dialog</DialogTitle>
                      <DialogDescription>
                        This is a default dialog with smooth animations.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p>Dialog content goes here...</p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button variant="default">Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="glass">Glass Dialog</Button>
                  </DialogTrigger>
                  <DialogContent variant="glass">
                    <DialogHeader>
                      <DialogTitle>Glass Dialog</DialogTitle>
                      <DialogDescription>
                        This dialog uses glassmorphism effect.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p>Dialog content goes here...</p>
                    </div>
                    <DialogFooter>
                      <Button variant="outline">Cancel</Button>
                      <Button variant="default">Confirm</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Menus Tab */}
        <TabsContent value="menus" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dropdown & Select Menus</CardTitle>
              <CardDescription>Test dropdown and select components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline">
                      Open Menu <ChevronDown className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Star className="mr-2 h-4 w-4" />
                      Favorites
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Select>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select option" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="option1">Option 1</SelectItem>
                    <SelectItem value="option2">Option 2</SelectItem>
                    <SelectItem value="option3">Option 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sliders Tab */}
        <TabsContent value="sliders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Slider & Switch</CardTitle>
              <CardDescription>Test slider and switch components</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Slider Value: {sliderValue[0]}
                  </label>
                  <Slider
                    value={sliderValue}
                    onValueChange={setSliderValue}
                    max={100}
                    step={1}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Switch State</label>
                  <Switch
                    checked={switchState}
                    onCheckedChange={setSwitchState}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Current state: {switchState ? "On" : "Off"}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Other Tab */}
        <TabsContent value="other" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Scroll Area & Command</CardTitle>
              <CardDescription>Test scroll area and command palette</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Scroll Area</label>
                <ScrollArea className="h-[200px] w-full rounded-md border p-4">
                  <div className="space-y-2">
                    {Array.from({ length: 20 }).map((_, i) => (
                      <div key={i} className="text-sm p-2 bg-muted/50 rounded">
                        Scroll Item {i + 1}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>

              <Separator />

              <Button
                variant="outline"
                onClick={() => setCommandOpen(true)}
              >
                Open Command Palette (⌘K)
              </Button>

              <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                  <CommandEmpty>No results found.</CommandEmpty>
                  <CommandGroup heading="Suggestions">
                    <CommandItem>
                      <Circle className="mr-2 h-4 w-4" />
                      <span>Calendar</span>
                    </CommandItem>
                    <CommandItem>
                      <Circle className="mr-2 h-4 w-4" />
                      <span>Search Emoji</span>
                    </CommandItem>
                    <CommandItem>
                      <Circle className="mr-2 h-4 w-4" />
                      <span>Calculator</span>
                    </CommandItem>
                  </CommandGroup>
                </CommandList>
              </CommandDialog>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator className="my-8" />

      <Card>
        <CardHeader>
          <CardTitle>Component Test Summary</CardTitle>
          <CardDescription>
            All Shadcn/UI components have been tested with Apple-inspired micro-interactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Button (7 variants)</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Card (3 variants)</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Badge (7 variants)</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Input & Textarea</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Dialog (2 variants)</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Dropdown Menu</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Select</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Switch</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Slider</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Tabs</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Separator</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Toast & Toaster</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Scroll Area</span>
            </div>
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 fill-green-500 text-green-500" />
              <span className="text-sm">Command Palette</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
