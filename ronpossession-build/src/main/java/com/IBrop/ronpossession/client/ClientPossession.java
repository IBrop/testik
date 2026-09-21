package com.IBrop.ronpossession.client;

import com.IBrop.ronpossession.network.ExitPossessionPacket;
import com.IBrop.ronpossession.network.HeroAttackPacket;
import com.IBrop.ronpossession.network.HeroInputPacket;
import com.IBrop.ronpossession.network.ModNetwork;
import com.IBrop.ronpossession.network.PossessHeroPacket;
import com.solegendary.reignofnether.cursor.CursorClientEvents;
import com.solegendary.reignofnether.guiscreen.TopdownGui;
import com.solegendary.reignofnether.hud.buttons.Button;
import com.solegendary.reignofnether.orthoview.OrthoviewClientEvents;
import com.solegendary.reignofnether.unit.UnitAction;
import com.solegendary.reignofnether.unit.UnitClientEvents;
import com.solegendary.reignofnether.unit.interfaces.HeroUnit;
import com.solegendary.reignofnether.unit.interfaces.Unit;
import net.minecraft.client.KeyMapping;
import net.minecraft.client.Minecraft;
import net.minecraft.client.gui.GuiGraphics;
import net.minecraft.client.resources.language.I18n;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.phys.BlockHitResult;
import net.minecraft.world.phys.EntityHitResult;
import net.minecraft.world.phys.HitResult;
import net.minecraftforge.client.event.InputEvent;
import net.minecraftforge.client.event.RegisterKeyMappingsEvent;
import net.minecraftforge.client.event.RenderGuiOverlayEvent;
import net.minecraftforge.client.event.ScreenEvent;
import net.minecraftforge.common.MinecraftForge;
import net.minecraftforge.event.TickEvent;
import net.minecraftforge.eventbus.api.IEventBus;
import net.minecraftforge.eventbus.api.SubscribeEvent;
import org.lwjgl.glfw.GLFW;

import java.util.List;

public final class ClientPossession {
    private static final Minecraft MC = Minecraft.getInstance();

    private static final int POSSESS_BUTTON_W = 86;
    private static final int POSSESS_BUTTON_H = 20;

    private static KeyMapping possessKey;
    private static Integer possessedHeroId = null;
    private static boolean returnToRtsCamera = false;

    private ClientPossession() {}

    public static void register(IEventBus modBus) {
        modBus.addListener(ClientPossession::registerKeys);
        MinecraftForge.EVENT_BUS.register(ClientPossession.class);
    }

    private static void registerKeys(RegisterKeyMappingsEvent event) {
        possessKey = new KeyMapping(
                "key.ronpossession.possess",
                GLFW.GLFW_KEY_P,
                "key.categories.ronpossession"
        );
        event.register(possessKey);
    }

    public static boolean isPossessing() {
        return possessedHeroId != null;
    }

    private static LivingEntity getPossessedHero() {
        if (MC.level == null || possessedHeroId == null) {
            return null;
        }
        Entity entity = MC.level.getEntity(possessedHeroId);
        return entity instanceof LivingEntity living ? living : null;
    }

    private static LivingEntity getSingleSelectedOwnedHero() {
        if (MC.player == null) {
            return null;
        }

        List<LivingEntity> selected = UnitClientEvents.getSelectedUnits();
        if (selected.size() != 1) {
            return null;
        }

        LivingEntity living = selected.get(0);
        if (!(living instanceof HeroUnit hero)) {
            return null;
        }

        return hero.getOwnerName().equals(MC.player.getName().getString()) ? living : null;
    }

    public static void enter(LivingEntity hero) {
        if (!(hero instanceof HeroUnit)) {
            return;
        }

        returnToRtsCamera = OrthoviewClientEvents.isEnabled();
        possessedHeroId = hero.getId();

        try {
            UnitClientEvents.sendUnitCommandManual(
                    UnitAction.STOP,
                    -1,
                    new int[] { hero.getId() }
            );
        } catch (Throwable ignored) {
        }

        ModNetwork.CHANNEL.sendToServer(new PossessHeroPacket(hero.getId()));

        if (returnToRtsCamera && OrthoviewClientEvents.isEnabled()) {
            OrthoviewClientEvents.toggleEnable();
        }

        MC.setScreen(null);
        MC.setCameraEntity(hero);

        if (!MC.mouseHandler.isMouseGrabbed()) {
            MC.mouseHandler.grabMouse();
        }
    }

    public static void exit() {
        if (!isPossessing()) {
            return;
        }

        possessedHeroId = null;
        ModNetwork.CHANNEL.sendToServer(new ExitPossessionPacket());

        if (MC.player != null) {
            MC.setCameraEntity(MC.player);
        }

        if (returnToRtsCamera && !OrthoviewClientEvents.isEnabled()) {
            OrthoviewClientEvents.toggleEnable();
        }

        returnToRtsCamera = false;
    }

    @SubscribeEvent
    public static void onClientTick(TickEvent.ClientTickEvent event) {
        if (event.phase != TickEvent.Phase.END || MC.player == null) {
            return;
        }

        if (possessKey != null && possessKey.consumeClick()) {
            if (isPossessing()) {
                exit();
            } else {
                LivingEntity selectedHero = getSingleSelectedOwnedHero();
                if (selectedHero != null) {
                    enter(selectedHero);
                }
            }
        }

        if (!isPossessing()) {
            return;
        }

        LivingEntity hero = getPossessedHero();
        if (hero == null || !hero.isAlive()) {
            exit();
            return;
        }

        hero.setYRot(MC.player.getYRot());
        hero.setXRot(MC.player.getXRot());
        hero.setYHeadRot(MC.player.getYRot());

        float forward = 0.0F;
        float strafe = 0.0F;

        if (MC.options.keyUp.isDown()) forward += 1.0F;
        if (MC.options.keyDown.isDown()) forward -= 1.0F;
        if (MC.options.keyLeft.isDown()) strafe += 1.0F;
        if (MC.options.keyRight.isDown()) strafe -= 1.0F;

        ModNetwork.CHANNEL.sendToServer(new HeroInputPacket(
                forward,
                strafe,
                MC.options.keyJump.isDown(),
                MC.options.keyShift.isDown(),
                MC.options.keySprint.isDown(),
                MC.player.getYRot(),
                MC.player.getXRot()
        ));

        MC.player.input.forwardImpulse = 0.0F;
        MC.player.input.leftImpulse = 0.0F;
        MC.player.input.jumping = false;
        MC.player.input.shiftKeyDown = false;
    }

    @SubscribeEvent
    public static void onMouseButton(InputEvent.MouseButton.Pre event) {
        if (!isPossessing() || event.getAction() != GLFW.GLFW_PRESS) {
            return;
        }

        if (event.getButton() == GLFW.GLFW_MOUSE_BUTTON_LEFT) {
            if (MC.hitResult instanceof EntityHitResult entityHitResult) {
                ModNetwork.CHANNEL.sendToServer(
                        new HeroAttackPacket(entityHitResult.getEntity().getId())
                );
            }
        }
    }

    @SubscribeEvent
    public static void onKey(InputEvent.Key event) {
        if (!isPossessing() || event.getAction() != GLFW.GLFW_PRESS) {
            return;
        }

        if (event.getKey() >= GLFW.GLFW_KEY_1 && event.getKey() <= GLFW.GLFW_KEY_9) {
            useAbility(event.getKey() - GLFW.GLFW_KEY_1);
        }
    }

    private static void useAbility(int index) {
        LivingEntity heroEntity = getPossessedHero();
        if (!(heroEntity instanceof Unit unit)) {
            return;
        }

        List<Button> buttons = unit.getAbilityButtons();
        if (index < 0 || index >= buttons.size()) {
            return;
        }

        Button button = buttons.get(index);
        if (button == null || button.isHidden.get() || !button.isEnabled.get() || button.onLeftClick == null) {
            return;
        }

        button.onLeftClick.run();

        UnitAction pendingAction = CursorClientEvents.getLeftClickAction();
        if (pendingAction != null) {
            int targetId = -1;
            net.minecraft.core.BlockPos blockPos = heroEntity.blockPosition();

            HitResult hit = MC.hitResult;
            if (hit instanceof EntityHitResult ehr) {
                targetId = ehr.getEntity().getId();
                blockPos = ehr.getEntity().blockPosition();
            } else if (hit instanceof BlockHitResult bhr) {
                blockPos = bhr.getBlockPos();
            }

            UnitClientEvents.sendUnitCommandManual(
                    pendingAction,
                    targetId,
                    new int[] { heroEntity.getId() },
                    blockPos
            );

            CursorClientEvents.setLeftClickAction(null);
        }
    }

    @SubscribeEvent
    public static void onTopdownRender(ScreenEvent.Render.Post event) {
        if (!(event.getScreen() instanceof TopdownGui) || isPossessing()) {
            return;
        }

        LivingEntity selectedHero = getSingleSelectedOwnedHero();
        if (selectedHero == null) {
            return;
        }

        int x = event.getScreen().width / 2 - POSSESS_BUTTON_W / 2;
        int y = event.getScreen().height - 54;

        GuiGraphics g = event.getGuiGraphics();
        boolean hover = event.getMouseX() >= x && event.getMouseX() < x + POSSESS_BUTTON_W
                && event.getMouseY() >= y && event.getMouseY() < y + POSSESS_BUTTON_H;

        int bg = hover ? 0xCC4C6FFF : 0xCC252A34;
        g.fill(x, y, x + POSSESS_BUTTON_W, y + POSSESS_BUTTON_H, bg);
        g.renderOutline(x, y, POSSESS_BUTTON_W, POSSESS_BUTTON_H, 0xFFFFFFFF);

        String label = I18n.get("gui.ronpossession.possess");
        g.drawCenteredString(MC.font, label, x + POSSESS_BUTTON_W / 2, y + 6, 0xFFFFFF);
    }

    @SubscribeEvent
    public static void onTopdownClick(ScreenEvent.MouseButtonPressed.Pre event) {
        if (!(event.getScreen() instanceof TopdownGui) || event.getButton() != GLFW.GLFW_MOUSE_BUTTON_LEFT) {
            return;
        }

        LivingEntity selectedHero = getSingleSelectedOwnedHero();
        if (selectedHero == null) {
            return;
        }

        int x = event.getScreen().width / 2 - POSSESS_BUTTON_W / 2;
        int y = event.getScreen().height - 54;

        if (event.getMouseX() >= x && event.getMouseX() < x + POSSESS_BUTTON_W
                && event.getMouseY() >= y && event.getMouseY() < y + POSSESS_BUTTON_H) {
            enter(selectedHero);
            event.setCanceled(true);
        }
    }

    @SubscribeEvent
    public static void onHud(RenderGuiOverlayEvent.Post event) {
        if (!isPossessing()) {
            return;
        }

        LivingEntity heroEntity = getPossessedHero();
        if (!(heroEntity instanceof Unit unit)) {
            return;
        }

        GuiGraphics g = event.getGuiGraphics();
        int width = MC.getWindow().getGuiScaledWidth();
        int height = MC.getWindow().getGuiScaledHeight();

        int slot = 24;
        int totalW = 9 * slot;
        int startX = width / 2 - totalW / 2;
        int y = height - 28;

        g.fill(startX - 4, y - 4, startX + totalW + 4, y + slot + 4, 0xDD111318);

        List<Button> buttons = unit.getAbilityButtons();
        int count = Math.min(9, buttons.size());

        for (int i = 0; i < 9; i++) {
            int x = startX + i * slot;
            g.renderOutline(x, y, 22, 22, 0xFF777777);

            if (i < count) {
                Button button = buttons.get(i);
                if (button != null && !button.isHidden.get()) {
                    button.render(g, x, y, -9999, -9999);
                }
            }

            g.drawString(MC.font, Integer.toString(i + 1), x + 2, y + 2, 0xFFFFFF, true);
        }

        g.drawCenteredString(
                MC.font,
                I18n.get("gui.ronpossession.hint"),
                width / 2,
                y - 12,
                0xFFFFFF
        );
    }
}
