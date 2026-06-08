import { InteractionComponent } from '../entities/InteractionComponent';
import Phaser from 'phaser';

export class InteractionSystem {
  private interactables: Set<InteractionComponent> = new Set();

  public register(component: InteractionComponent): void {
    this.interactables.add(component);
  }

  public unregister(component: InteractionComponent): void {
    this.interactables.delete(component);
  }

  public getClosestInteractable(
    playerX: number,
    playerY: number
  ): InteractionComponent | null {
    let closestComponent: InteractionComponent | null = null;
    let closestDistance = Infinity;

    for (const comp of this.interactables) {
      if (!comp.enabled) continue;

      const pos = comp.getInteractionPosition();
      const dist = Phaser.Math.Distance.Between(playerX, playerY, pos.x, pos.y);

      // Must be within the object's specific detection radius
      if (dist <= comp.radius) {
        if (dist < closestDistance) {
          closestDistance = dist;
          closestComponent = comp;
        }
      }
    }

    return closestComponent;
  }

  public clear(): void {
    this.interactables.clear();
  }
}
