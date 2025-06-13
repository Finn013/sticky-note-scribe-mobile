
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TagSelectorProps {
  availableTags: string[];
  onSelectTag: (tag: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({ availableTags, onSelectTag }) => {
  if (availableTags.length === 0) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-6 w-6 p-0">
          <ChevronDown size={12} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="bottom" className="w-40 max-h-48 overflow-y-auto">
        {availableTags.map(tag => (
          <DropdownMenuItem
            key={tag}
            onClick={() => onSelectTag(tag)}
            className="cursor-pointer"
          >
            {tag}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TagSelector;
