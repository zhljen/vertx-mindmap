import org.vertx.java.core.Handler;
import org.vertx.java.core.eventbus.Message;
import org.vertx.java.core.json.JsonObject;
import org.vertx.java.platform.Verticle;
public class PNGExporter extends Verticle {
  public void start() {
    Handler<Message<JsonObject>>exportHandler =new Handler<Message<JsonObject>>() {
      public void handle(Message<JsonObject> message) {
        String svg = message.body().getString("svg");
        String css = message.body().getString("css");
        message.reply(new JsonObject().putString("data",          getPng(svg, css)));
      }
    };
    vertx.eventBus().registerHandler("com.vertxbook.svg2png", exportHandler);
  }
}
