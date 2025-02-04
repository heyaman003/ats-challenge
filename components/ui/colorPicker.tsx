import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { HexColorPicker } from 'react-colorful';

interface ColorPickerProps {
  label: string;
  color: string;
  onChange: (color: string) => void;
  onClear: () => void;
}

export function ColorPicker({ label, color, onChange, onClear }: ColorPickerProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          style={{ backgroundColor: color }}
        >
          <span>{label}</span>
          <div className="w-4 h-4 rounded-full border" style={{ backgroundColor: color }} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-4 space-y-2">
        <HexColorPicker color={color} onChange={onChange} />
        <Input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Enter hex color"
        />
        <Button variant="outline" size="sm" onClick={onClear}>
          Clear
        </Button>
      </PopoverContent>
    </Popover>
  );
}