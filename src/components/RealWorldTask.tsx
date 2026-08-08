import { getLucideIcon } from "../lib/icons";
import type { LevelConfig } from "../types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface RealWorldTaskProps {
  level: LevelConfig;
  selectedChoice?: string;
  onSelectChoice: (choiceId: string) => void;
  onContinue: () => void;
}

export function RealWorldTask({
  level,
  selectedChoice,
  onSelectChoice,
  onContinue,
}: RealWorldTaskProps) {
  const hasSelected = selectedChoice !== undefined;

  return (
    <Dialog open={true}>
      <DialogContent
        className="max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-xl text-center">{level.realWorldTask.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <p className="text-center text-slate-600">{level.realWorldTask.description}</p>

          <div className="flex flex-col gap-2">
            {level.realWorldTask.choices.map((choice) => {
              const Icon = getLucideIcon(choice.icon);
              const isSelected = selectedChoice === choice.id;

              return (
                <Button
                  key={choice.id}
                  variant={isSelected ? "default" : "outline"}
                  className={`h-auto py-3 px-4 justify-start gap-3 text-left ${
                    isSelected ? "bg-emerald-600 hover:bg-emerald-700" : ""
                  }`}
                  onClick={() => onSelectChoice(choice.id)}
                >
                  {Icon && <Icon className="w-5 h-5 shrink-0" />}
                  <span className="text-base">{choice.label}</span>
                </Button>
              );
            })}
          </div>

          <Button
            variant={hasSelected ? "default" : "ghost"}
            className={`w-full ${
              hasSelected
                ? "bg-orange-500 hover:bg-orange-600 text-white"
                : "text-slate-400 hover:text-slate-600"
            }`}
            onClick={onContinue}
          >
            {hasSelected ? "完成，請家長確認" : "這次先跳過"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
