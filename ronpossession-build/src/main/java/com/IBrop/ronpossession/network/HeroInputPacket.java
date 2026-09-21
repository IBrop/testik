package com.IBrop.ronpossession.network;

import com.IBrop.ronpossession.server.ServerPossession;
import net.minecraft.network.FriendlyByteBuf;
import net.minecraftforge.network.NetworkEvent;
import java.util.function.Supplier;

public record HeroInputPacket(float forward, float strafe, boolean jump, boolean sneak, boolean sprint, float yaw, float pitch) {
    public static void encode(HeroInputPacket msg, FriendlyByteBuf buf) {
        buf.writeFloat(msg.forward()); buf.writeFloat(msg.strafe());
        buf.writeBoolean(msg.jump()); buf.writeBoolean(msg.sneak()); buf.writeBoolean(msg.sprint());
        buf.writeFloat(msg.yaw()); buf.writeFloat(msg.pitch());
    }
    public static HeroInputPacket decode(FriendlyByteBuf buf) {
        return new HeroInputPacket(buf.readFloat(), buf.readFloat(), buf.readBoolean(), buf.readBoolean(),
                buf.readBoolean(), buf.readFloat(), buf.readFloat());
    }
    public static void handle(HeroInputPacket msg, Supplier<NetworkEvent.Context> ctxSupplier) {
        NetworkEvent.Context ctx = ctxSupplier.get();
        ctx.enqueueWork(() -> { if (ctx.getSender() != null) ServerPossession.applyInput(ctx.getSender(), msg); });
        ctx.setPacketHandled(true);
    }
}
