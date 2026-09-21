package com.IBrop.ronpossession.server;

import com.IBrop.ronpossession.network.HeroInputPacket;
import com.solegendary.reignofnether.unit.interfaces.HeroUnit;
import net.minecraft.server.level.ServerPlayer;
import net.minecraft.world.entity.Entity;
import net.minecraft.world.entity.LivingEntity;
import net.minecraft.world.entity.Mob;
import net.minecraft.world.entity.ai.attributes.Attributes;
import net.minecraft.world.entity.monster.RangedAttackMob;
import net.minecraft.world.phys.Vec3;
import net.minecraftforge.event.entity.player.PlayerEvent;
import net.minecraftforge.eventbus.api.SubscribeEvent;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

public final class ServerPossession {
    private static final Map<UUID, Integer> POSSESSED_HERO = new HashMap<>();
    private static final Map<UUID, Long> LAST_ATTACK_TICK = new HashMap<>();

    private ServerPossession() {}

    public static void begin(ServerPlayer player, int heroEntityId) {
        Entity entity = player.level().getEntity(heroEntityId);

        if (!(entity instanceof Mob mob) || !(mob instanceof HeroUnit hero)) {
            return;
        }

        if (!hero.getOwnerName().equals(player.getName().getString())) {
            return;
        }

        POSSESSED_HERO.put(player.getUUID(), heroEntityId);
        mob.getNavigation().stop();
        mob.setTarget(null);
    }

    public static void end(ServerPlayer player) {
        POSSESSED_HERO.remove(player.getUUID());
        LAST_ATTACK_TICK.remove(player.getUUID());
    }

    public static void applyInput(ServerPlayer player, HeroInputPacket msg) {
        Mob hero = getPossessedMob(player);
        if (hero == null) {
            end(player);
            return;
        }

        hero.getNavigation().stop();
        hero.setTarget(null);

        float yaw = msg.yaw();
        float pitch = Math.max(-90.0F, Math.min(90.0F, msg.pitch()));

        hero.setYRot(yaw);
        hero.setXRot(pitch);
        hero.setYHeadRot(yaw);
        hero.setYBodyRot(yaw);

        double speed = hero.getAttributeValue(Attributes.MOVEMENT_SPEED);
        if (speed <= 0.0D) {
            speed = 0.20D;
        }
        speed *= msg.sprint() ? 1.35D : 1.05D;

        double forward = clampInput(msg.forward());
        double strafe = clampInput(msg.strafe());

        double length = Math.sqrt(forward * forward + strafe * strafe);
        if (length > 1.0D) {
            forward /= length;
            strafe /= length;
        }

        double yawRad = Math.toRadians(yaw);
        double sin = Math.sin(yawRad);
        double cos = Math.cos(yawRad);

        double motionX = (-sin * forward + cos * strafe) * speed;
        double motionZ = ( cos * forward + sin * strafe) * speed;

        Vec3 old = hero.getDeltaMovement();
        double motionY = old.y;

        if (msg.jump() && hero.onGround()) {
            motionY = Math.max(motionY, 0.42D);
        } else if (!hero.onGround() && msg.sneak()) {
            motionY = Math.min(motionY, -0.18D);
        }

        hero.setDeltaMovement(motionX, motionY, motionZ);
        hero.hasImpulse = true;
    }

    public static void attack(ServerPlayer player, int targetEntityId) {
        Mob hero = getPossessedMob(player);
        if (hero == null) {
            end(player);
            return;
        }

        Entity rawTarget = hero.level().getEntity(targetEntityId);
        if (!(rawTarget instanceof LivingEntity target) || !target.isAlive()) {
            return;
        }

        if (target == hero || target.distanceToSqr(hero) > 64.0D) {
            return;
        }

        long now = hero.level().getGameTime();
        long last = LAST_ATTACK_TICK.getOrDefault(player.getUUID(), Long.MIN_VALUE / 4);
        if (now - last < 8L) {
            return;
        }
        LAST_ATTACK_TICK.put(player.getUUID(), now);

        hero.getNavigation().stop();
        hero.setTarget(target);

        if (hero instanceof RangedAttackMob ranged && target.distanceToSqr(hero) > 9.0D) {
            ranged.performRangedAttack(target, 1.0F);
        } else {
            hero.doHurtTarget(target);
        }

        hero.setTarget(null);
    }

    private static Mob getPossessedMob(ServerPlayer player) {
        Integer heroId = POSSESSED_HERO.get(player.getUUID());
        if (heroId == null) {
            return null;
        }

        Entity entity = player.level().getEntity(heroId);
        if (!(entity instanceof Mob mob)
                || !(mob instanceof HeroUnit hero)
                || !hero.getOwnerName().equals(player.getName().getString())
                || !mob.isAlive()) {
            return null;
        }

        return mob;
    }

    private static double clampInput(float input) {
        return Math.max(-1.0D, Math.min(1.0D, input));
    }

    @SubscribeEvent
    public static void onLogout(PlayerEvent.PlayerLoggedOutEvent event) {
        if (event.getEntity() instanceof ServerPlayer player) {
            end(player);
        }
    }

    @SubscribeEvent
    public static void onDimensionChange(PlayerEvent.PlayerChangedDimensionEvent event) {
        if (event.getEntity() instanceof ServerPlayer player) {
            end(player);
        }
    }
}
